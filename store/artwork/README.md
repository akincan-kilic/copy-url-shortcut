# Store screenshot source

The original `screenshot-toast.png` and `screenshot-onboarding.png` remain unchanged. Upload them first, followed by `screenshot-menu.png` and `screenshot-confirmations.png`.

Both new store images are 1280×800 RGB PNGs, with no alpha. The HTML composition sources are `menu.html` and `confirmations.html`.

`captures/popup-light.png` and `popup-dark.png` are captures of the implemented extension's `popup.html`. They show a user-assigned URL shortcut and an unassigned Markdown shortcut.

The four confirmation captures use the production renderer in `page-copy.js`: Link copied, Markdown copied, Checkmark, and Couldn’t copy.

`../render-assets.cjs` regenerates the production confirmation captures and the two composed store images. It needs Playwright and Sharp as development tools; the extension itself has no runtime dependencies. Use `node store/render-assets.cjs` after making those tools available to Node.

When changing the popup, recapture it in a loaded unpacked extension before regenerating the menu artwork. Keep the image captions accurate to the installed behavior.

For the 128×128 store icon, upload `../icon128.png`. Its outer padding is transparent. Runtime toolbar icons live in `../../icons/`.
