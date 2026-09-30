// Chrome serializes this function for executeScript: every helper must be local.
export async function runPageCopy(urlHint, toastOnly = false, options = {}) {
  const hostAttr = "data-copy-url-shortcut";
  const url = typeof location.href === "string" && location.href.length > 0
    ? location.href : typeof urlHint === "string" ? urlHint : "";
  const title = typeof document.title === "string" ? document.title : options.titleHint || "";
  const markdown = options.format === "markdown";
  const text = markdown ? formatMarkdown(url, title) : url;
  const error = options.error === true;
  const preview = options.preview === true;
  let copied = Boolean(toastOnly) && !error && !preview;

  if (!toastOnly) {
    if (!url) return { url: "", text: "", copied: false, toasted: false };
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      return { url, text, copied: false, toasted: false };
    }
  }

  const label = error ? "Couldn’t copy" : markdown ? "Markdown copied" : "Link copied";
  const checkOnly = options.confirmation === "check" && !error;
  const toasted = presentToast();
  return { url, text, copied, toasted, previewed: preview && toasted };

  function formatMarkdown(address, pageTitle) {
    // Same escaping as core.markdownLink; required here because injections have no imports.
    const label = (pageTitle.trim() || address).replace(/[\r\n]+/g, " ").replace(/[\\`*_\[\]<>]/g, "\\$&");
    const destination = address.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/[\r\n]/g, "");
    return `[${label}](<${destination}>)`;
  }

  function presentToast() {
    const root = document.documentElement;
    if (!root) return false;
    document.querySelectorAll(`[${hostAttr}]`).forEach((node) => node.remove());
    const host = document.createElement("div");
    host.setAttribute(hostAttr, "");
    host.style.cssText = "all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = toastCss();
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    const toast = document.createElement("div");
    toast.className = `toast${checkOnly ? " check-only" : ""}${error ? " error" : ""}`;
    toast.setAttribute("role", error ? "alert" : "status");
    toast.setAttribute("aria-live", error ? "assertive" : "polite");
    toast.setAttribute("aria-atomic", "true");
    if (checkOnly || preview) toast.setAttribute("aria-label", `${preview ? "Preview: " : ""}${label}`);
    if (error) {
      const indicator = document.createElement("span");
      indicator.className = "error-dot";
      indicator.setAttribute("aria-hidden", "true");
      indicator.textContent = "!";
      toast.append(indicator);
    } else {
      toast.append(checkIcon());
    }
    if (!checkOnly) toast.append(document.createTextNode(label));
    wrap.append(toast);
    shadow.append(style, wrap);
    root.append(host);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      if (!host.isConnected) return;
      toast.classList.add("is-out");
      window.setTimeout(() => host.remove(), reduced ? 110 : 170);
    }, error ? 2800 : reduced ? 800 : 1000);
    return true;
  }

  function checkIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "icon");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M3.2 8.4 6.2 11.3 12.8 4.6");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  function toastCss() {
    return `
      :host { all: initial; }
      .wrap { position:fixed; top:22px; left:50%; transform:translateX(-50%); }
      .toast {
        display:flex; align-items:center; justify-content:center; gap:8px;
        height:32px; padding:0 12px 0 10px; border-radius:999px;
        color:rgba(255,255,255,.96);
        background:linear-gradient(160deg,rgba(53,54,58,.94),rgba(37,38,41,.94));
        border:1px solid rgba(255,255,255,.14);
        box-shadow:0 7px 20px rgba(0,0,0,.18),0 1px 0 rgba(255,255,255,.04) inset;
        -webkit-backdrop-filter:blur(18px) saturate(1.4); backdrop-filter:blur(18px) saturate(1.4);
        font:520 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:-.01em; white-space:nowrap; animation:toast-in 140ms ease-out both;
      }
      .icon { width:13px; height:13px; flex:0 0 auto; }
      .check-only { width:32px; padding:0; }
      .error-dot { display:grid; place-items:center; width:15px; height:15px;
        border-radius:50%; background:#edc4bd; color:#563b36; font:700 11px/1 system-ui; }
      .is-out { animation:toast-out 150ms ease-in both; }
      @keyframes toast-in { from {opacity:0;transform:translateY(-6px)} to {opacity:1;transform:translateY(0)} }
      @keyframes toast-out { from {opacity:1;transform:translateY(0)} to {opacity:0;transform:translateY(-4px)} }
      @media(prefers-reduced-motion:reduce) {
        .toast { animation:toast-fade 90ms ease both; }
        .is-out { animation:toast-fade-out 90ms ease both; }
        @keyframes toast-fade { from {opacity:0} to {opacity:1} }
        @keyframes toast-fade-out { from {opacity:1} to {opacity:0} }
      }
      @media(prefers-reduced-transparency:reduce) { .toast {background:#292a2e;backdrop-filter:none} }
      @media(prefers-contrast:more) { .toast {background:#1c1c1e;border-color:#a1a1a6} }
    `;
  }
}
