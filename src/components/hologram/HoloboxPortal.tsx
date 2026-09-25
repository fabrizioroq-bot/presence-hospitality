import { cn } from "@/lib/cn";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { DecryptedText } from "@/components/ui/DecryptedText";
import { HologramPoster } from "./HologramPoster";

/** The dark Holobox frame that hosts the hologram (poster now, WebGL in phase 3). */
export function HoloboxPortal({
  hud,
  description,
  className,
}: {
  hud: { online: string; route: string; live: string };
  description: string;
  className?: string;
}) {
  return (
    <figure
      data-portal
      className={cn("relative isolate overflow-hidden rounded-xl shadow-soft ring-1 ring-white/5", className)}
    >
      {/* DOM fill + poster: visible until the WebGL scene paints the same panel. */}
      <div aria-hidden className="portal-fill absolute inset-0 -z-10 bg-night-900" />
      <div
        aria-hidden
        className="portal-fill absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 100%, rgba(47,127,208,0.28) 0%, rgba(47,127,208,0) 70%), radial-gradient(80% 60% at 50% 40%, rgba(140,196,255,0.08) 0%, rgba(18,20,23,0) 70%)",
        }}
      />
      {/* Glass-case edges */}
      <div aria-hidden className="portal-fill absolute inset-y-10 left-[14%] w-px bg-linear-to-b from-transparent via-holo-400/15 to-transparent" />
      <div aria-hidden className="portal-fill absolute inset-y-10 right-[14%] w-px bg-linear-to-b from-transparent via-holo-400/15 to-transparent" />

      <div className="portal-fill absolute inset-x-0 top-[9%] bottom-[5%]">
        <HologramPoster />
      </div>

      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3 text-label text-paper-300 lg:inset-x-6 lg:top-6">
        <span className="inline-flex items-center gap-2">
          <span className="live-dot" aria-hidden />
          <DecryptedText text={hud.online} delay={300} />
        </span>
        <DecryptedText text={hud.route} delay={600} className="hidden sm:inline" />
      </div>
      <div className="absolute inset-x-5 bottom-5 text-label text-paper-300 lg:inset-x-6 lg:bottom-6">
        <DecryptedText text={hud.live} delay={900} />
      </div>

      <figcaption className="sr-only">{description}</figcaption>
      <BorderBeam />
    </figure>
  );
}
