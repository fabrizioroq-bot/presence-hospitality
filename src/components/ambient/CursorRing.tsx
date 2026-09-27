"use client";

import { useEffect, useRef } from "react";

export type CursorLabels = { drag: string; book: string; play: string };

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
const CONTEXT = "[data-cursor], .btn-cta, a, button, [role='button'], summary, input, textarea, select, [contenteditable='true']";

/**
 * Contextual cursor (desktop, fine pointers, motion allowed; the native cursor stays):
 * a thin ring trails the mouse, grows over links/buttons, and shows a small label pill in context
 * ("Drag" on the Holobox stage, "Book" on conversion CTAs, "Play" on media). It hides over form fields.
 * Also drives the magnetic pull of `.magnetic` buttons (a few px towards the cursor).
 */
export function CursorRing({ labels }: { labels: CursorLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const lb = label.current;
    if (!el || !lb) return;
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;
    let mag: HTMLElement | null = null;
    const loop = () => {
      cx += (x - cx) * 0.24;
      cy += (y - cy) * 0.24;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const setState = (state: string, text = "") => {
      if (el.dataset.state !== state) el.dataset.state = state;
      if (lb.textContent !== text) lb.textContent = text;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        cx = x;
        cy = y;
        el.style.opacity = "1";
      }
      const t = e.target instanceof Element ? e.target : null;
      const c = t?.closest(CONTEXT);
      if (!c) setState("");
      else if (c.matches("input, textarea, select, [contenteditable='true']")) setState("hidden");
      else {
        const k = c.getAttribute("data-cursor") ?? (c.classList.contains("btn-cta") ? "book" : "");
        const text = k && k in labels ? labels[k as keyof CursorLabels] : "";
        setState(text ? "label" : k === "none" ? "hidden" : "link", text);
      }
      const mood = t?.closest("[data-mood]")?.getAttribute("data-mood") ?? "mist";
      if (el.dataset.mood !== mood) el.dataset.mood = mood;

      // Magnetic buttons: pull ≤ 6px towards the pointer; released with a CSS spring-like ease.
      const m = (t?.closest(".magnetic") as HTMLElement | null) ?? null;
      if (m !== mag) {
        if (mag) mag.style.translate = "";
        mag = m;
      }
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.translate = `${clamp((x - (r.left + r.width / 2)) * 0.18, 6)}px ${clamp((y - (r.top + r.height / 2)) * 0.3, 4)}px`;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      shown = false;
      el.style.opacity = "0";
      if (mag) mag.style.translate = "";
      mag = null;
    };
    const onDown = () => el.setAttribute("data-press", "");
    const onUp = () => el.removeAttribute("data-press");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (mag) mag.style.translate = "";
    };
  }, [labels]);
  return (
    <div ref={ref} aria-hidden className="cursor-ring" data-mood="mist">
      <i />
      <span ref={label} />
    </div>
  );
}
