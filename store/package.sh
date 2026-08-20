#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
out="store/copy-url-shortcut.zip"
rm -f "$out"
zip -X -r "$out" \
  manifest.json \
  service-worker.js \
  core.js \
  copy.js \
  page-copy.js \
  offscreen.html \
  offscreen.js \
  onboarding.html \
  onboarding.js \
  icons \
  LICENSE \
  -x "*.DS_Store" "icons/*.svg" "icons/icon256.png"
echo "Wrote $out"
