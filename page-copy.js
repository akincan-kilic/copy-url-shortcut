export async function runPageCopy(urlHint, toastOnly) {
  const hostAttr = "data-copy-url-shortcut";

  const url =
    typeof location.href === "string" && location.href.length > 0
      ? location.href
      : typeof urlHint === "string"
        ? urlHint
        : "";

  let copied = Boolean(toastOnly);

  if (!toastOnly) {
    if (!url) {
      return { url: "", copied: false, toasted: false };
    }
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      copied = false;
    }
  }

  if (!copied && !toastOnly) {
    return { url, copied: false, toasted: false };
  }

  presentToast();
  return { url, copied: true, toasted: true };

  function presentToast() {
    document.querySelectorAll(`[${hostAttr}]`).forEach((node) => {
      node.remove();
    });

    const host = document.createElement("div");
    host.setAttribute(hostAttr, "");
    host.style.cssText =
      "all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647;";

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = toastCss();

    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    toast.append(checkIcon(), document.createTextNode("Link copied"));
    wrap.append(toast);
    shadow.append(style, wrap);

    const root = document.documentElement;
    if (!root) {
      return;
    }
    root.append(host);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enterMs = reduced ? 0 : 140;
    const visibleMs = reduced ? 800 : 860;
    const exitMs = reduced ? 90 : 150;

    window.setTimeout(() => {
      if (!host.isConnected) {
        return;
      }
      toast.classList.add("is-out");
      window.setTimeout(() => {
        host.remove();
      }, exitMs + 20);
    }, enterMs + visibleMs);
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

      .wrap {
        position: fixed;
        top: 22px;
        left: 50%;
        transform: translateX(-50%);
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px 8px 10px;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.96);
        background: rgba(28, 28, 30, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow:
          0 10px 28px rgba(0, 0, 0, 0.22),
          0 1px 0 rgba(255, 255, 255, 0.08) inset;
        -webkit-backdrop-filter: blur(18px) saturate(1.4);
        backdrop-filter: blur(18px) saturate(1.4);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px;
        font-weight: 560;
        letter-spacing: -0.01em;
        line-height: 1;
        white-space: nowrap;
        animation: toast-in 140ms ease-out both;
      }

      .icon {
        width: 13px;
        height: 13px;
        flex: 0 0 auto;
      }

      .toast.is-out {
        animation: toast-out 150ms ease-in both;
      }

      @keyframes toast-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes toast-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-4px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: toast-fade 90ms ease both;
        }

        .toast.is-out {
          animation: toast-fade-out 90ms ease both;
        }

        @keyframes toast-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes toast-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      }
    `;
  }
}
