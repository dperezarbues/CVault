#!/usr/bin/env bash
set -euo pipefail
[ "${CV_DEBUG:-0}" = "1" ] && set -x

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

# Usage: generate-pdf.sh [template] [layout]
#   template — name of a .typ file in src/typst/templates/ (default: "default")
#   layout   — layout name passed to the template via --input (default: "default")
#
# Output naming:
#   default + default  → public/cv.pdf
#   default + <other>  → public/cv-<layout>.pdf
#   <template>         → public/cv-<template>.pdf
#   <template> + <lay> → public/cv-<template>-<layout>.pdf

TEMPLATE="${1:-default}"
LAYOUT="${2:-default}"
TEMPLATE_TYP="src/typst/templates/${TEMPLATE}.typ"

if [[ ! -f "$TEMPLATE_TYP" ]]; then
  echo "Error: template '${TEMPLATE}' not found at ${TEMPLATE_TYP}" >&2
  exit 1
fi

if [[ "$TEMPLATE" == "default" && "$LAYOUT" == "default" ]]; then
  OUTPUT="public/cv.pdf"
elif [[ "$TEMPLATE" == "default" ]]; then
  OUTPUT="public/cv-${LAYOUT}.pdf"
elif [[ "$LAYOUT" == "default" ]]; then
  OUTPUT="public/cv-${TEMPLATE}.pdf"
else
  OUTPUT="public/cv-${TEMPLATE}-${LAYOUT}.pdf"
fi

CV_FILE="${3:-}"

echo "→ Compiling ${TEMPLATE_TYP} → ${OUTPUT} (layout: ${LAYOUT})"
rm -f "$OUTPUT"
TYPST_INPUTS=(--input layout="${LAYOUT}")
[ -n "$CV_FILE"              ] && TYPST_INPUTS+=(--input cv_file="${CV_FILE}")
[ "${CV_SHOW_FOOTER:-}"        = "true" ] && TYPST_INPUTS+=(--input show_footer="true")
[ "${CV_SHOW_QR:-}"           = "true" ] && TYPST_INPUTS+=(--input show_qr="true")
[ "${CV_SHOW_CONTACT_ICONS:-}"  = "true" ] && TYPST_INPUTS+=(--input show_contact_icons="true")
[ "${CV_SHOW_CONTACT_LABELS:-}" = "true" ] && TYPST_INPUTS+=(--input show_contact_labels="true")
[ -n "${CV_QR_URL:-}"                  ] && TYPST_INPUTS+=(--input qr_url="${CV_QR_URL}")
"$TYPST_BIN" compile --root . "${TYPST_INPUTS[@]}" "$TEMPLATE_TYP" "$OUTPUT"
echo "✓ ${OUTPUT} generated"
