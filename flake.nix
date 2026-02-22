{
  description = "PKB Hugo Theme — development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
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
            hugo      # extended — static site generator
            go        # Hugo modules
            nodejs    # SEO & image scripts
            git
            wget
            curl
            htmltest
          ];

          shellHook = ''
            echo "PKB-theme dev shell"
            echo "  Hugo : $(hugo version 2>/dev/null | head -c 60)"
            echo "  Go   : $(go version)"
            echo "  Node : $(node --version)"
          '';
        };
      }
    );
}
