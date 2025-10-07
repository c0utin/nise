{
  description = "Nise – Modular generative art with React + Three.js";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.vscode-langservers-extracted
          ];

          shellHook = ''
            echo "🎨 Nise Development Environment"
            echo "================================"
            echo "Node.js: $(node --version)"
            echo "npm: $(npm --version)"
            echo ""
            echo "Commands:"
            echo "  npm install  - Install dependencies"
            echo "  npm run dev  - Start dev server (http://localhost:3000)"
            echo "  npm run build - Build for production"
            echo "  npm run deploy - Deploy to GitHub Pages"
            echo ""
            echo "Tribute to Nise da Silveira (1905-1999)"
            echo "================================"
          '';
        };
      });
}
