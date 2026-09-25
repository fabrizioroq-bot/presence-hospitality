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

/** Smoothly scrolls to an in-page target, then moves focus there (keyboard + screen readers). */
export function scrollToHash(hash: string) {
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
    instance.scrollTo(id === "top" ? 0 : target, { onComplete: focus });
  } else {
    const y = id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - navOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
    focus();
  }
  history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
  return true;
}
