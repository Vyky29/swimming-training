#!/bin/sh

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
TOOLS_ROOT=""

if [ -d "$SCRIPT_DIR/.tools" ]; then
  TOOLS_ROOT="$SCRIPT_DIR"
elif [ -d "$SCRIPT_DIR/../.tools" ]; then
  TOOLS_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
fi

if [ -n "$TOOLS_ROOT" ]; then
  export PATH="$TOOLS_ROOT/.tools/node/bin:$TOOLS_ROOT/.tools/vercel/node_modules/.bin:$TOOLS_ROOT/.tools/gh/gh_2.92.0_macOS_arm64/bin:$PATH"
  echo "Local tooling bundle found in: $TOOLS_ROOT/.tools"
else
  echo "No local .tools bundle found. Using tools installed on this machine."
fi

print_version() {
  if command -v "$1" >/dev/null 2>&1; then
    case "$1" in
      npm)
        npm -v
        ;;
      *)
        "$1" --version 2>/dev/null | sed -n '1p'
        ;;
    esac
  else
    echo "not found"
  fi
}

echo "Local tooling enabled:"
echo "  node:   $(print_version node)"
echo "  npm:    $(print_version npm)"
echo "  vercel: $(print_version vercel)"
echo "  gh:     $(print_version gh)"
