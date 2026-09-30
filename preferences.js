export const DEFAULT_PREFERENCES = Object.freeze({ confirmation: "text", theme: "auto" });

export function normalizePreferences(value = {}) {
  if (!value || typeof value !== "object") value = {};
  return {
    confirmation: value.confirmation === "check" ? "check" : "text",
    theme: ["auto", "light", "dark"].includes(value.theme) ? value.theme : "auto",
  };
}

export async function readPreferences() {
  const { preferences } = await chrome.storage.local.get("preferences");
  return normalizePreferences(preferences);
}

export async function savePreferences(preferences) {
  const value = normalizePreferences(preferences);
  await chrome.storage.local.set({ preferences: value });
  return value;
}
