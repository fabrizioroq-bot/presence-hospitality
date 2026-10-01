import Image from "next/image";
import type { CSSProperties } from "react";
import { HERO_PHOTO } from "@/content/hero-photos";
import { cn } from "@/lib/cn";

type Vars = CSSProperties & Record<`--${string}`, string>;

/**
 * The hero's first impression: a real hotel photograph in the portal-shaped card, with a soft
 * holographic-blue edge light and one small status card. Server component, no client JS.
 */
export function HeroPhoto({ alt, status, className }: { alt: string; status: string; className?: string }) {
  const p = HERO_PHOTO;
  return (
    <figure className={cn("hero-photo relative isolate overflow-hidden rounded-xl shadow-soft", className)}>
      <Image
        src={p.src}
        alt={alt}
        width={p.width}
        height={p.height}
        priority
        fetchPriority="high"
        quality={80}
        sizes="(min-width: 1024px) 36vw, 94vw"
        className="hero-photo-img absolute inset-0 h-full w-full object-cover object-(--pos-m) lg:object-(--pos-d)"
        style={{ "--pos-m": p.focus.mobile, "--pos-d": p.focus.desktop } as Vars}
      />
      {/* Holographic-blue edge light: the only nod to the concept here. */}
      <span aria-hidden className="hero-photo-glow pointer-events-none absolute inset-0 rounded-[inherit]" />
      <figcaption className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 rounded-pill bg-mist-raised/85 px-4 py-2.5 text-body-sm font-semibold text-ink-900 shadow-[0_0_0_1px_rgba(140,196,255,0.55),0_8px_28px_-6px_rgba(47,127,208,0.55)] backdrop-blur-md lg:bottom-6 lg:left-6">
        <span aria-hidden className="live-dot" />
        {status}
      </figcaption>
    </figure>
  );
}
