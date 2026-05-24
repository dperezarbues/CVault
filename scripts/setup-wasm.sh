#!/usr/bin/env bash
# Prepares browser-side WASM compilation assets.
# Run once after npm install, or whenever typst source files change.
# Output directories are gitignored — re-run in CI before build.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── 1. WASM binary ────────────────────────────────────────────────────────────
WASM_SRC="node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm"
WASM_DST="public/wasm/typst-compiler.wasm"
mkdir -p public/wasm
if [ ! -f "$WASM_DST" ] || [ "$WASM_SRC" -nt "$WASM_DST" ]; then
  echo "→ Copying WASM binary…"
  cp "$WASM_SRC" "$WASM_DST"
  echo "  $(du -sh "$WASM_DST" | cut -f1)  $WASM_DST"
fi

# ── 2. Typst source files ─────────────────────────────────────────────────────
echo "→ Copying Typst source assets…"
mkdir -p public/typst/templates public/typst/icons
cp src/typst/*.typ        public/typst/
cp src/typst/templates/*.typ public/typst/templates/
cp src/typst/icons/*.svg  public/typst/icons/

# Fonts (New Computer Modern) are committed in public/fonts/ — no download needed.

echo "✓ WASM setup complete."
