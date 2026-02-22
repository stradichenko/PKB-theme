{
  description = "PKB Hugo Theme — development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "pkb-theme";

          buildInputs = with pkgs; [
            # Hugo (extended) — static site generator
            hugo

            # Go — needed for Hugo modules
            go

            # Node.js + npm — for image optimisation & SEO scripts
            nodejs

            # Git — Hugo modules & general VCS
            git

            # Utilities used by test-hugo-theme.sh
            wget
            curl
            htmltest
          ];

          shellHook = ''
            echo "🚀 PKB-theme dev shell"
            echo "   Hugo    : $(hugo version 2>/dev/null | head -c 60)"
            echo "   Go      : $(go version)"
            echo "   Node    : $(node --version)"
            echo ""
            echo "Run 'npm install' if you need the Node.js dev-dependencies."
          '';
        };
      }
    );
}
