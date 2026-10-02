"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { buttonClass, Arrow } from "@/components/ui/Button";
import { cx as cn } from "@/lib/cx";
import { getLenis } from "@/lib/smooth-scroll";

type Mood = "mist" | "night";

/** A navbar link: a page, or a section on the current page (sectionId set, rendered as #hash). */
export type NavLink = { key: string; label: string; href: string; sectionId?: string };

export type NavbarLabels = {
  skip: string;
  bookDemo: string;
  switchLocale: string;
  menuOpen: string;
  menuClose: string;
  primaryNav: string;
  mobileMenu: string;
};

/** Page link (next/link) or same-page section link (#hash, smooth scroll via Lenis). */
function NavA({ l, active, className, onClick, children }: { l: NavLink; active: boolean; className: string; onClick?: () => void; children: ReactNode }) {
  return l.sectionId ? (
    <a href={`#${l.sectionId}`} className={className} onClick={onClick} aria-current={active ? "true" : undefined}>
      {children}
    </a>
  ) : (
    <Link href={l.href} className={className} onClick={onClick} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}

/**
 * Client navbar. Links, labels and localized URLs come in as props from the server, so the
 * i18n runtime stays on the server. Page links use next/link (client navigation + page
 * transition); links to a section on the current page stay plain #hash (smooth scroll).
 */
export function Navbar({
  locale,
  labels,
  links,
  homeHref,
  demoHref,
  switchHref,
  activeKey,
}: {
  locale: "en" | "nl";
  labels: NavbarLabels;
  links: NavLink[];
  homeHref: string;
  demoHref: string;
  switchHref: string;
  activeKey: string | null;
}) {
  const c = (k: keyof NavbarLabels) => labels[k];
  const other = locale === "en" ? "nl" : "en";

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mood, setMood] = useState<Mood>("mist");
  const [sectionActive, setSectionActive] = useState<string | null>(null);
  const active = sectionActive ?? activeKey;
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
    // Skip the header itself and full-screen overlays (intro loader, page-transition veil, cursor).
    const el = stack
      .find((n) => !headerRef.current?.contains(n) && !n.closest("#ph-intro, canvas.fixed, .cursor-ring"))
      ?.closest<HTMLElement>("[data-mood]");
    setMood((el?.dataset.mood as Mood) ?? "mist");
  }, [setMood]);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(detectMood);
    };
    detectMood();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("ph:intro-done", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("ph:intro-done", onScroll);
    };
  }, [detectMood]);

  // Section links (on the current page) light up while their section is in view.
  useEffect(() => {
    const byId = new Map(links.filter((l) => l.sectionId).map((l) => [l.sectionId!, l.key]));
    if (!byId.size) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSectionActive(byId.get(e.target.id) ?? null);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [links]);

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
      ? "bg-charcoal-700/80 backdrop-blur-[14px] shadow-[inset_0_-1px_0_rgba(98,120,130,0.35)]"
      : "bg-mist-bg/85 backdrop-blur-[14px] shadow-[inset_0_-1px_0_rgba(220,216,210,0.9)]"
    : "bg-transparent";

  return (
    <>
      <a
        href="#main"
        className="sr-only-focusable fixed top-3 left-3 z-[70] rounded-pill bg-petrol px-4 py-2 text-paper-50"
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
          <Link href={homeHref} className="rounded-sm" aria-label="Presence Hospitality — home">
            <Logo onNight={night} />
          </Link>

          <nav aria-label={c("primaryNav")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.key} className="relative">
                  <NavA
                    l={l}
                    active={active === l.key}
                    className={cn(
                      "relative flex min-h-11 items-center rounded-pill px-3.5 text-[1rem] font-semibold transition-opacity xl:px-4",
                      active === l.key ? "opacity-100" : "opacity-85 hover:opacity-100",
                    )}
                  >
                    {l.label}
                    <span
                      aria-hidden
                      className={cn(
                        "nav-ind absolute inset-x-4 -bottom-0.5 h-[2px] origin-left rounded-full transition-transform duration-300 ease-out",
                        active === l.key ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </NavA>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={switchHref}
              hrefLang={other}
              aria-label={c("switchLocale")}
              className="hidden min-h-11 items-center gap-1 rounded-pill px-3 text-label sm:inline-flex"
            >
              <span className={locale === "en" ? "opacity-100" : "opacity-70"}>EN</span>
              <span aria-hidden className="opacity-40">|</span>
              <span className={locale === "nl" ? "opacity-100" : "opacity-70"}>NL</span>
            </a>
            <span className="hidden sm:inline-flex">
              <Link href={demoHref} className={buttonClass({ mood: night ? "night" : "mist" })}>
                {c("bookDemo")}
                <Arrow />
              </Link>
            </span>
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
                {links.map((l, i) => (
                  <li key={l.key} className="sheet-item" style={{ animationDelay: `${50 + i * 60}ms` }}>
                    <NavA l={l} active={active === l.key} onClick={() => setOpen(false)} className="block py-2 text-display-lg">
                      {l.label}
                    </NavA>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="container-site flex items-center justify-between gap-4 border-t border-line-night/40 py-6">
              <a
                href={switchHref}
                hrefLang={other}
                aria-label={c("switchLocale")}
                className="inline-flex min-h-11 items-center gap-2 text-label"
              >
                <span className={locale === "en" ? "" : "opacity-70"}>EN</span>
                <span aria-hidden className="opacity-40">|</span>
                <span className={locale === "nl" ? "" : "opacity-70"}>NL</span>
              </a>
              <Link href={demoHref} onClick={() => setOpen(false)} className={buttonClass({ mood: "night" })}>
                {c("bookDemo")}
                <Arrow />
              </Link>
            </div>
          </div>
      )}
    </>
  );
}
