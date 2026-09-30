import Image from "next/image";
import type { CSSProperties } from "react";
import { HERO_PHOTOS, HERO_PHOTO_DEFAULT } from "@/content/hero-photos";
import { cn } from "@/lib/cn";

type Vars = CSSProperties & Record<`--${string}`, string>;

/**
 * The hero's first impression: a real reception photograph in the portal-shaped card, with a soft
 * holographic-blue edge light and one small status card. All variants are in the markup, but only
 * the visible one downloads (hidden ones are display:none + lazy). Server component, no client JS.
 */
export function HeroPhoto({ alts, status, className }: { alts: Record<string, string>; status: string; className?: string }) {
  return (
    <figure className={cn("hero-photo relative isolate overflow-hidden rounded-xl shadow-soft", className)}>
      {HERO_PHOTOS.map((p, i) => {
        const n = i + 1;
        const isDefault = n === HERO_PHOTO_DEFAULT;
        return (
          <Image
            key={p.src}
            src={p.src}
            alt={alts[p.altKey]}
            width={p.width}
            height={p.height}
            priority={isDefault}
            fetchPriority={isDefault ? "high" : "low"}
            quality={72}
            sizes="(min-width: 1024px) 36vw, 94vw"
            data-v={n}
            data-default={isDefault ? "" : undefined}
            className="hero-variant absolute inset-0 h-full w-full object-cover object-(--pos-m) lg:object-(--pos-d)"
            style={{ "--pos-m": p.focus.mobile, "--pos-d": p.focus.desktop } as Vars}
          />
        );
      })}
      {/* Holographic-blue edge light: the only nod to the concept here. */}
      <span aria-hidden className="hero-photo-glow pointer-events-none absolute inset-0 rounded-[inherit]" />
      <figcaption className="absolute bottom-4 left-4 inline-flex items-center gap-2.5 rounded-pill bg-mist-raised/85 px-4 py-2.5 text-body-sm font-semibold text-ink-900 shadow-[0_0_0_1px_rgba(140,196,255,0.55),0_8px_28px_-6px_rgba(47,127,208,0.55)] backdrop-blur-md lg:bottom-6 lg:left-6">
        <span aria-hidden className="live-dot" />
        {status}
      </figcaption>
    </figure>
  );
}
