# Changelog

## 1.1.0 — Released 2026-10-01

### Added

- **Copy as Markdown:** copy the page title and URL as a Markdown link from the menu or a separate keyboard shortcut. The Markdown shortcut is optional and unassigned by default.
- **Settings menu:** open the toolbar menu to copy links, choose your preferences, view assigned shortcuts, and open shortcut settings.
- **Confirmation styles:** choose the familiar text pill or a compact checkmark, with a live preview when selecting a style. Text confirmations distinguish “Link copied” from “Markdown copied.”
- **Menu appearance:** choose Auto, Light, or Dark. Auto follows system appearance; appearance and confirmation preferences are saved locally.
- **Failure feedback:** show “Couldn’t copy” when a copy fails, with a readable toolbar tooltip and menu message when an in-page confirmation is unavailable.

### Changed

- Redesigned the link icon in Graphite, with transparent padding and adjustments for readability at small sizes.
- Clicking the toolbar icon now opens the menu. Use its Copy URL or Copy Markdown button to copy the current page.

The original URL shortcut is unchanged and still copies the full URL, including query parameters and fragments. Copied URLs and page titles are never stored or transmitted.

## 1.0.0

### Added

- Copy the current tab’s URL with a keyboard shortcut or toolbar click.
- Brief “Link copied” confirmation after copying.
- Clipboard fallback and toolbar feedback for restricted browser pages.
- Onboarding guidance for assigning the browser shortcut.
