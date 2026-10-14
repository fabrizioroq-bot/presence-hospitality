"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";

type Beam = { id: string; d: string; x1: number; y1: number; x2: number; y2: number; delay: number; out: boolean };

/**
 * Hub-and-spoke integrations diagram (adapted from Magic UI "Animated Beam", CSS-only pulses).
 * Curves are computed from the real node positions, so it works for the horizontal (desktop)
 * and stacked (mobile) layouts alike.
 */
export function BeamDiagram({
  hub,
  guest,
  systems,
  guestLabel,
  systemLabel,
  desc,
}: {
  hub: string;
  guest: { id: string; label: string }[];
  systems: { id: string; label: string }[];
  guestLabel: string;
  systemLabel: string;
  desc: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const guestGroup = useRef<HTMLDivElement>(null);
  const systemGroup = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const [beams, setBeams] = useState<Beam[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrap.current;
    const h = hubRef.current;
    if (!el || !h) return;
    let raf = 0;
    const compute = () => {
      const wr = el.getBoundingClientRect();
      const hr = h.getBoundingClientRect();
      const hc = { x: hr.left + hr.width / 2 - wr.left, y: hr.top + hr.height / 2 - wr.top };
      const next: Beam[] = [];
      const add = (id: string, out: boolean, i: number, target?: HTMLElement | null) => {
        const n = target ?? nodes.current.get(id);
        if (!n) return;
        const r = n.getBoundingClientRect();
        const nc = { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top };
        const dx = hc.x - nc.x;
        const dy = hc.y - nc.y;
        const horizontal = Math.abs(dx) > Math.abs(dy) * 0.9;
        // Anchor on the node edge facing the hub, and on the hub's circle.
        const a = horizontal
          ? { x: nc.x + Math.sign(dx) * (r.width / 2), y: nc.y }
          : { x: nc.x, y: nc.y + Math.sign(dy) * (r.height / 2) };
        const hubR = hr.width / 2;
        const len = Math.hypot(a.x - hc.x, a.y - hc.y) || 1;
        const b = { x: hc.x + ((a.x - hc.x) / len) * hubR, y: hc.y + ((a.y - hc.y) / len) * hubR };
        const [s, e] = out ? [b, a] : [a, b];
        const k = 0.5;
        const d = horizontal
          ? `M${s.x} ${s.y} C${s.x + (e.x - s.x) * k} ${s.y} ${e.x - (e.x - s.x) * k} ${e.y} ${e.x} ${e.y}`
          : `M${s.x} ${s.y} C${s.x} ${s.y + (e.y - s.y) * k} ${e.x} ${e.y - (e.y - s.y) * k} ${e.x} ${e.y}`;
        next.push({ id, d, x1: s.x, y1: s.y, x2: e.x, y2: e.y, delay: i * 0.35, out });
      };
      if (window.matchMedia("(min-width: 1024px)").matches) {
        // Desktop: one beam per node.
        guest.forEach((g, i) => add(g.id, false, i));
        systems.forEach((sys, i) => add(sys.id, true, i + 1));
      } else {
        // Stacked layout: one clean trunk in and one out, so beams never cross the pills.
        add("guest-group", false, 0, guestGroup.current);
        add("system-group", true, 1, systemGroup.current);
      }
      setBeams(next);
      setSize({ w: wr.width, h: wr.height });
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [guest, systems]);

  const pill = (n: { id: string; label: string }) => (
    <span
      key={n.id}
      ref={(el) => {
        if (el) nodes.current.set(n.id, el);
        else nodes.current.delete(n.id);
      }}
      className="relative z-10 inline-flex min-h-10 items-center rounded-pill bg-mist-raised px-4 py-2 text-label whitespace-nowrap text-ink-900 shadow-soft ring-1 ring-line-mist/70"
    >
      {n.label}
    </span>
  );

  return (
    <figure className="relative">
      <div
        ref={wrap}
        aria-hidden
        className="relative flex flex-col items-center gap-14 py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-16"
      >
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h} fill="none">
          <defs>
            {beams.map((b) => (
              <linearGradient key={b.id} id={`beam-${b.id}`} gradientUnits="userSpaceOnUse" x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}>
                <stop offset="0" stopColor="var(--holo-500)" stopOpacity="0" />
                <stop offset="0.5" stopColor="var(--holo-500)" />
                <stop offset="1" stopColor="var(--amber-400)" />
              </linearGradient>
            ))}
          </defs>
          {beams.map((b) => (
            <g key={b.id}>
              <path d={b.d} stroke="var(--line-mist)" strokeOpacity="0.35" strokeWidth="1.5" />
              <path
                d={b.d}
                pathLength={100}
                className="beam-pulse"
                stroke={`url(#beam-${b.id})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ animationDelay: `${b.delay}s` }}
              />
            </g>
          ))}
        </svg>

        <div ref={guestGroup} className="flex flex-col items-center gap-3 lg:items-end">
          <span className="text-label text-ink-500">{guestLabel}</span>
          <div className="flex flex-wrap justify-center gap-3 lg:flex-col lg:items-end">{guest.map(pill)}</div>
        </div>

        <div ref={hubRef} className="relative z-10 grid h-24 w-24 place-items-center rounded-full bg-petrol text-paper-50 shadow-glow-holo">
          <span className="hub-ring absolute inset-0 rounded-full" />
          <LogoMark on="dark" className="h-9 w-9" />
          <span className="absolute -bottom-8 text-label whitespace-nowrap text-ink-900">{hub}</span>
        </div>

        <div ref={systemGroup} className="mt-6 flex flex-col items-center gap-3 lg:mt-0 lg:items-start">
          <span className="text-label text-ink-500">{systemLabel}</span>
          <div className="flex flex-wrap justify-center gap-3 lg:flex-col lg:items-start">{systems.map(pill)}</div>
        </div>
      </div>
      <figcaption className="sr-only">{desc}</figcaption>
    </figure>
  );
}

