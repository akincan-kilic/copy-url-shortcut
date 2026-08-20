export function resolveActiveUrl({ pageHref, tabUrl }) {
  if (typeof pageHref === "string" && pageHref.length > 0) {
    return pageHref;
  }
  if (typeof tabUrl === "string" && tabUrl.length > 0) {
    return tabUrl;
  }
  return null;
}

export function confirmationFor({ copied, injectionSucceeded }) {
  if (!copied) {
    return "error-badge";
  }
  return injectionSucceeded ? "toast" : "badge";
}

export function shouldOpenOnboarding({ reason, shortcut }) {
  return reason === "install" && !shortcut;
}

export function shouldCreateOffscreen(existingCount) {
  return existingCount === 0;
}

export const COPY_COMMAND = "copy-url";
export const OFFSCREEN_PATH = "offscreen.html";
