# Chrome Web Store listing

## Title

Copy URL Shortcut

## Short description

Copy the current tab URL with ⌘⇧C. Open source, dormant until invoked, no tracking.

## Detailed description

I used Arc for years. ⌘⇧C to copy the current link became muscle memory, one of those tiny things you stop noticing until it is gone.

When I moved to Chromium after Arc was sunset, my hands kept hitting the shortcut. Nothing happened. The extensions I found were either always running in every page, or they rewrote the URL, or they came with a settings panel I did not want.

Copy URL Shortcut is that one interaction: press ⌘⇧C, copy the current URL exactly, see "Link copied," and disappear.

Setup

1. Install the extension.
2. Open chrome://extensions/shortcuts
3. Assign ⌘⇧C (Ctrl+Shift+C on Windows and Linux). Chrome already uses that shortcut for Inspect, so the one-time assignment is required.

Click the toolbar icon to copy without a shortcut.

The URL is copied as the page has it, including query parameters and fragments. Nothing is rewritten.

No persistent content script, no analytics, no accounts, and no settings screen.

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

Use store/screenshot-toast.png and store/screenshot-onboarding.png (1280x800).

## Promotional image

Use store/promo-440x280.png (440x280). The full-resolution banner for GitHub is store/promo-1760x1120.png.

## Single purpose

Copies the active tab's URL to the clipboard when explicitly invoked by the user and displays a brief confirmation.

## Remote code

No, I am not using remote code.

## Permission justifications

### activeTab

Temporarily accesses the current tab only when the user invokes Copy URL.

### scripting

Injects the brief "Link copied" confirmation into the active page after the user invokes the extension.

### clipboardWrite

Writes the active tab URL to the local clipboard.

### offscreen

Provides clipboard access on pages where normal script injection is unavailable.

## Privacy certification

- No user data is collected.
- No personally identifiable information is collected.
- No website content is collected.
- No web history is collected.
- No user activity is collected.
- No website authentication information is collected.

## Privacy policy URL

https://github.com/akincan-kilic/copy-url-shortcut/blob/main/PRIVACY.md
