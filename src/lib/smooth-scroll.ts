import type Lenis from "lenis";

// Module singleton so any client component can pause or drive the smooth scroller.
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

const navOffset = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
  return (parseFloat(v) || 72) + 16;
};

/** Scrolls to an in-page target (smooth, or instant after a page transition), then moves focus there. */
export function scrollToHash(hash: string, opts: { immediate?: boolean } = {}) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const target = id === "top" ? document.body : document.getElementById(id);
  if (!target) return false;
  const focus = () => {
    if (target === document.body) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  if (instance) {
    // Lenis already honours the CSS `scroll-padding-top` (nav height + 16px) set on <html>.
    instance.scrollTo(id === "top" ? 0 : target, { onComplete: focus, immediate: opts.immediate });
  } else {
    const y = id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - navOffset();
    window.scrollTo({ top: y, behavior: opts.immediate ? "instant" : "smooth" });
    focus();
  }
  history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
  return true;
}

/** Jump to the top instantly (new page after a client-side navigation). */
export function resetScroll() {
  if (instance) instance.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
