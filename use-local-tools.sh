#!/bin/sh

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
WORKSPACE_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export PATH="$WORKSPACE_ROOT/.tools/node/bin:$WORKSPACE_ROOT/.tools/vercel/node_modules/.bin:$WORKSPACE_ROOT/.tools/gh/gh_2.92.0_macOS_arm64/bin:$PATH"

echo "Local tooling enabled:"
echo "  node:   $(node -v)"
echo "  npm:    $(node "$WORKSPACE_ROOT/.tools/node/lib/node_modules/npm/bin/npm-cli.js" -v)"
echo "  vercel: $(vercel --version | head -n 1)"
echo "  gh:     $(gh --version | head -n 1)"
