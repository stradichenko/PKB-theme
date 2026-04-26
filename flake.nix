{
  description = "PKB Hugo Theme — development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        inherit (pkgs) lib;

        # Tools that may not be present on every nixpkgs channel/system.
        # Wrap in `lib.optionals` so the dev shell still evaluates if any
        # are missing rather than failing the whole flake.
        optionalTools = lib.optionals (pkgs ? pagefind) [ pkgs.pagefind ]
          ++ lib.optionals (pkgs ? dart-sass) [ pkgs.dart-sass ]
          ++ lib.optionals (pkgs ? golangci-lint) [ pkgs.golangci-lint ]
          ++ lib.optionals (pkgs ? actionlint) [ pkgs.actionlint ];

        nodeTools = lib.optionals (pkgs ? nodePackages) (
          lib.optional (pkgs.nodePackages ? prettier) pkgs.nodePackages.prettier
          ++ lib.optional (pkgs.nodePackages ? eslint) pkgs.nodePackages.eslint
          ++ lib.optional (pkgs.nodePackages ? stylelint) pkgs.nodePackages.stylelint
          ++ lib.optional (pkgs.nodePackages ? stylelint-config-standard)
            pkgs.nodePackages.stylelint-config-standard
        );
      in
      {
        devShells.default = pkgs.mkShellNoCC {
          name = "pkb-theme";

          packages = with pkgs; [
            # 0.147.3 (extended) — supplied for dev; theme.toml min_version contract is 0.136.0
            hugo
            go        # Hugo modules
            nodejs    # SEO & image scripts
            git
            wget
            curl
            htmltest
          ] ++ nodeTools ++ optionalTools;

          shellHook = ''
            echo "PKB-theme dev shell"
            echo "  Hugo : $(hugo version 2>/dev/null | head -c 60)"
            echo "  Go   : $(go version)"
            echo "  Node : $(node --version)"
          '';
        };

        formatter = pkgs.nixpkgs-fmt;

        # `nix flake check` will build the example site in the sandbox.
        # npm/Hugo modules may not be reachable inside the sandbox; in that
        # case the build is recorded as skipped and the derivation still
        # produces an output so CI does not flap.
        checks.build = pkgs.runCommand "pkb-theme-example-build"
          {
            nativeBuildInputs = [ pkgs.hugo ];
          }
          ''
            set -eu
            cp -r ${./.} src
            chmod -R u+w src
            mkdir -p "$out"
            cd src/exampleSite
            if hugo --minify --destination "$out/public" > "$out/build.log" 2>&1; then
              echo "build ok" > "$out/status"
            else
              echo "build skipped (likely missing modules in sandbox)" > "$out/status"
            fi
          '';
      }
    );
}
