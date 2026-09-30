#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
out="store/copy-url-shortcut.zip"
rm -f "$out"
zip -X "$out" \
  manifest.json service-worker.js core.js preferences.js copy.js page-copy.js \
  popup.html popup.css popup.js offscreen.html offscreen.js \
  onboarding.html onboarding.js LICENSE \
  icons/icon16.png icons/icon32.png icons/icon48.png icons/icon64.png icons/icon128.png
printf 'Wrote %s\n' "$out"
