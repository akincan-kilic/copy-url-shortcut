export function resolveActiveUrl({ pageHref, tabUrl }) {
  if (typeof pageHref === "string" && pageHref.length > 0) return pageHref;
  if (typeof tabUrl === "string" && tabUrl.length > 0) return tabUrl;
  return null;
}

export function confirmationFor({ copied, injectionSucceeded }) {
  if (!copied) return "error-badge";
  return injectionSucceeded ? "toast" : "badge";
}

export function shouldOpenOnboarding({ reason, shortcut }) {
  return reason === "install" && !shortcut;
}

export function shouldCreateOffscreen(existingCount) {
  return existingCount === 0;
}

export function markdownLink(url, title = "") {
  // Angle brackets preserve spaces and parentheses without changing URL parameters.
  const label = (title.trim() || url).replace(/[\r\n]+/g, " ").replace(/[\\`*_\[\]<>]/g, "\\$&");
  const destination = url.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/[\r\n]/g, "");
  return `[${label}](<${destination}>)`;
}

export const COPY_COMMAND = "copy-url";
export const MARKDOWN_COMMAND = "copy-url-markdown";
export const OFFSCREEN_PATH = "offscreen.html";
