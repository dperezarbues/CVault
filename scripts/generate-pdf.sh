#!/usr/bin/env bash
set -euo pipefail

TYPST_VERSION="0.13.1"
TYPST_CACHE="${TMPDIR:-/tmp}/typst-${TYPST_VERSION}"
TYPST_BIN="${TYPST_CACHE}/typst"

if [ ! -f "$TYPST_BIN" ]; then
  echo "→ Downloading Typst ${TYPST_VERSION}..."
  mkdir -p "$TYPST_CACHE"

  OS=$(uname -s)
  ARCH=$(uname -m)

  if [ "$OS" = "Darwin" ]; then
    [ "$ARCH" = "arm64" ] && TARGET="aarch64-apple-darwin" || TARGET="x86_64-apple-darwin"
  else
    TARGET="x86_64-unknown-linux-musl"
  fi

  curl -fsSL "https://github.com/typst/typst/releases/download/v${TYPST_VERSION}/typst-${TARGET}.tar.xz" \
    | tar xJ --strip-components=1 -C "$TYPST_CACHE"
  echo "   Done."
fi

LAYOUT=${1:-default}
OUTPUT="public/cv${1:+-$1}.pdf"

echo "→ Compiling src/typst/cv.typ → ${OUTPUT} (layout: ${LAYOUT})"
rm -f "$OUTPUT"
"$TYPST_BIN" compile --root . --input layout="${LAYOUT}" src/typst/cv.typ "$OUTPUT"
echo "✓ ${OUTPUT} generated"
