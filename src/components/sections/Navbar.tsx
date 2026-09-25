"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { buttonClass, Arrow } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getLenis } from "@/lib/smooth-scroll";

const LINKS = [
  { id: "how-it-works", key: "howItWorks" },
  { id: "experience", key: "experience" },
  { id: "packages", key: "packages" },
  { id: "onboarding", key: "onboarding" },
  { id: "faq", key: "faq" },
] as const;

type Mood = "mist" | "night";

export type NavbarLabels = {
  links: Record<(typeof LINKS)[number]["key"], string>;
  skip: string;
  bookDemo: string;
  switchLocale: string;
  menuOpen: string;
  menuClose: string;
  primaryNav: string;
  mobileMenu: string;
};

/** Client navbar. Strings come in as props so the i18n runtime stays on the server. */
export function Navbar({ locale, labels }: { locale: "en" | "nl"; labels: NavbarLabels }) {
  const t = (k: keyof NavbarLabels["links"]) => labels.links[k];
  const c = (k: Exclude<keyof NavbarLabels, "links">) => labels[k];
  const other = locale === "en" ? "nl" : "en";

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mood, setMood] = useState<Mood>("mist");
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Scroll state: background after 24px, hide on scroll down, show on scroll up.
  // Plain listener (no Motion) keeps the navbar out of the animation bundle.
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    let prev = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (!openRef.current) {
          if (y - prev > 8 && y > 240) setHidden(true);
          else if (prev - y > 8) setHidden(false);
        }
        prev = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mood: read the data-mood of whatever section sits under the nav bar.
  const detectMood = useCallback(() => {
    const h = headerRef.current?.offsetHeight ?? 64;
    const stack = document.elementsFromPoint(window.innerWidth / 2, h + 2);
    const el = stack.find((n) => !headerRef.current?.contains(n))?.closest<HTMLElement>("[data-mood]");
    setMood((el?.dataset.mood as Mood) ?? "mist");
  }, []);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(detectMood);
    };
    detectMood();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [detectMood]);

  // Active section indicator.
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile sheet: lock scroll, focus trap, Esc to close, restore focus.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    const toggle = toggleRef.current;
    const focusables = () =>
      Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      );
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;
      const list = [toggle, ...focusables()].filter(Boolean) as HTMLElement[];
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const night = mood === "night" || open;
  const surface = scrolled && !open
    ? night
      ? "bg-charcoal-700/72 backdrop-blur-[14px] shadow-[inset_0_-1px_0_rgba(124,131,142,0.3)]"
      : "bg-mist-bg/72 backdrop-blur-[14px] shadow-[inset_0_-1px_0_rgba(99,104,112,0.3)]"
    : "bg-transparent";

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-3 left-3 z-[70] rounded-pill bg-ink-900 px-4 py-2 text-paper-50"
      >
        {c("skip")}
      </a>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-(--nav-h) transition-[transform,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          surface,
          night ? "text-paper-50" : "text-ink-900",
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          <a href="#top" className="rounded-sm" aria-label="Presence Hospitality — home">
            <Logo onNight={night} />
          </a>

          <nav aria-label={c("primaryNav")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((l) => (
                <li key={l.id} className="relative">
                  <a
                    href={`#${l.id}`}
                    aria-current={active === l.id ? "true" : undefined}
                    className={cn(
                      "relative block rounded-pill px-4 py-2 text-[0.9375rem] font-semibold transition-opacity",
                      active === l.id ? "opacity-100" : "opacity-75 hover:opacity-100",
                    )}
                  >
                    {t(l.key)}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-4 -bottom-0.5 h-[2px] origin-left rounded-full bg-holo-500 shadow-[0_0_12px_rgba(90,168,245,0.8)] transition-transform duration-300 ease-out",
                        active === l.id ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`/${other}`}
              hrefLang={other}
              aria-label={c("switchLocale")}
              className="hidden min-h-11 items-center gap-1 rounded-pill px-3 text-label sm:inline-flex"
            >
              <span className={locale === "en" ? "opacity-100" : "opacity-55"}>EN</span>
              <span aria-hidden className="opacity-40">|</span>
              <span className={locale === "nl" ? "opacity-100" : "opacity-55"}>NL</span>
            </a>
            <a
              href="#demo"
              className={buttonClass({ mood: night ? "night" : "mist", className: "hidden sm:inline-flex" })}
            >
              {c("bookDemo")}
              <Arrow />
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? c("menuClose") : c("menuOpen")}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-pill lg:hidden"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-300",
                  open ? "rotate-45" : "-translate-y-[4px]",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-300",
                  open ? "-rotate-45" : "translate-y-[4px]",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {open && (
          <div
            id="mobile-menu"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={c("mobileMenu")}
            data-mood="night"
            className="sheet-in fixed inset-0 z-40 flex flex-col bg-night-900 pt-(--nav-h) text-paper-50 lg:hidden"
          >
            <nav aria-label={c("primaryNav")} className="container-site flex-1 overflow-y-auto pt-10">
              <ul className="flex flex-col gap-2">
                {LINKS.map((l, i) => (
                  <li key={l.id} className="sheet-item" style={{ animationDelay: `${50 + i * 60}ms` }}>
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-display-lg"
                    >
                      {t(l.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="container-site flex items-center justify-between gap-4 border-t border-line-night/40 py-6">
              <a
                href={`/${other}`}
                hrefLang={other}
                aria-label={c("switchLocale")}
                className="inline-flex min-h-11 items-center gap-2 text-label"
              >
                <span className={locale === "en" ? "" : "opacity-55"}>EN</span>
                <span aria-hidden className="opacity-40">|</span>
                <span className={locale === "nl" ? "" : "opacity-55"}>NL</span>
              </a>
              <a href="#demo" onClick={() => setOpen(false)} className={buttonClass({ mood: "night" })}>
                {c("bookDemo")}
                <Arrow />
              </a>
            </div>
          </div>
      )}
    </>
  );
}
