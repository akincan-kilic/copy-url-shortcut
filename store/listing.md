# Chrome Web Store listing

## Title

Copy URL Shortcut

## Short description

Copy the current tab URL with one shortcut. Optional Markdown copying, elegant confirmations, and no tracking.

## Detailed description

Copy the current tab’s URL with one keyboard shortcut, without reaching for the address bar.

I used Arc for years. ⌘⇧C to copy the current link became muscle memory, one of those tiny things you stop noticing until it is gone.

When I moved to Chromium after Arc was sunset, my hands kept hitting the shortcut. Nothing happened. The extensions I found were either always running in every page, or they rewrote the URL, or they came with a settings panel I did not want.

Press ⌘⇧C on Mac or Ctrl+Shift+C on Windows and Linux. The URL is copied exactly as the page has it, including query parameters and fragments. Nothing is rewritten.

Click the toolbar icon for a compact menu:

- Copy the URL or copy the page title and URL as a Markdown link.
- Choose the familiar “Link copied” pill or a smaller checkmark confirmation. Selecting a style previews it on the current website.
- Choose a light or dark menu, or follow your system appearance automatically.
- View your keyboard shortcuts and open the browser’s shortcut settings.

Copy as Markdown is a separate optional shortcut. It is unassigned until you bind it; the original URL shortcut stays unchanged.

If copying fails, you see “Couldn’t copy.” Restricted browser pages use a toolbar indicator and readable tooltip because they cannot display an in-page confirmation.

What’s new in 1.1.0

- Copy the page title and URL as a Markdown link, with an optional separate shortcut.
- Open a compact settings menu from the toolbar, with Copy URL and Copy Markdown buttons.
- Choose text or checkmark confirmation, with a live preview of your choice. Text pills say “Link copied” or “Markdown copied” to match the action.
- Choose Auto, Light, or Dark menu appearance; preferences stay on your device.
- Get clear “Couldn’t copy” feedback when copying fails.
- Enjoy a redesigned Graphite link icon, refined for small toolbar sizes.

The original URL shortcut remains unchanged and copies the complete address, including query parameters and fragments.

Setup

1. Install the extension.
2. Open chrome://extensions/shortcuts, or choose Edit in the menu.
3. Assign ⌘⇧C (Ctrl+Shift+C on Windows and Linux). Chrome already uses that shortcut for Inspect, so a one-time assignment may be needed.
4. Optionally bind the separate Markdown command.

No persistent content scripts, no analytics, no accounts, and no host permissions. The extension reads the current tab only when you invoke it. Your two preferences stay on your device; copied links are never saved or sent anywhere.

Source: https://github.com/akincan-kilic/copy-url-shortcut
Built by Akin: https://akincankilic.com
Not affiliated with The Browser Company or Arc.

## Category

Productivity

## Homepage URL

https://github.com/akincan-kilic/copy-url-shortcut

## Support URL

https://github.com/akincan-kilic/copy-url-shortcut/issues

## Official URL

https://akincankilic.com

## Screenshots

Use these four 1280×800 images, in this order. The original first two are preserved:

1. `store/screenshot-toast.png`
2. `store/screenshot-onboarding.png`
3. `store/screenshot-menu.png` — the implemented light and dark menu
4. `store/screenshot-confirmations.png` — URL and Markdown pills, Checkmark, and failure feedback

Upload `store/icon128.png` as the store icon; toolbar icons are already in the extension package.

## Promotional image

Use store/promo-440x280.png (440x280) for the small tile and store/promo-1400x560.png (1400x560) for the marquee. The full-resolution banner for GitHub is store/promo-1760x1120.png.

## Single purpose

Copies the active tab’s URL, optionally formatted as a Markdown link, when explicitly invoked by the user and displays a brief confirmation.

## Remote code

No, I am not using remote code.

## Permission justifications

### activeTab

Temporarily accesses the current tab only when the user invokes Copy URL.

### scripting

Injects the brief "Link copied" confirmation into the active page after the user invokes the extension.

### clipboardWrite

Writes the active tab URL or a Markdown link to the local clipboard.

### offscreen

Provides clipboard access on pages where normal script injection is unavailable.

### storage

Saves only the local confirmation and appearance preferences. Session storage holds a transient failed-copy tab ID so the menu can explain a failed copy; copied URLs and page titles are never saved.

## Privacy certification

- No user data is collected.
- No personally identifiable information is collected.
- No website content is collected.
- No web history is collected.
- No user activity is collected.
- No website authentication information is collected.

## Privacy policy URL

https://github.com/akincan-kilic/copy-url-shortcut/blob/main/PRIVACY.md
