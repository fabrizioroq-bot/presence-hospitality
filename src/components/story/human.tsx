import Image from "next/image";
import { cx as cn } from "@/lib/cx";

/*
 * The human layer of the guest journey: short lines of dialogue in the lobby scene and the real
 * person behind the hologram. Same timeline (s = 0..6) as the scene, so it works for the pinned
 * desktop story and the mobile carousel alike. Decorative for screen readers (the step copy says it).
 */

export type HumanLabels = {
  guest: string; // "Guest"
  reception: string; // "Reception"
  sayProblem: string;
  sayHello: string;
  sayThanks: string;
  cardTitle: string; // "Behind the hologram"
  cardBody: string; // "A real receptionist at our hub, live."
};

export type HumanState = { talk: "problem" | "hello" | "thanks" | null; card: boolean };

/** Which line is spoken, and whether the receptionist card shows, at scene position s. */
export function humanState(s: number): HumanState {
  const talk = s >= 2.3 && s < 3.05 ? "problem" : s >= 4.55 && s < 5.05 ? "hello" : s >= 5.3 && s < 5.85 ? "thanks" : null;
  return { talk, card: s >= 4.4 };
}

// Where each bubble sits in the 16:10 stage: classes .story-bubble--<key> in globals.css, with the
// tail on the speaker's head (guest bubbles open to the right, the receptionist's to the left).
const TAIL = { problem: "left", thanks: "left", hello: "right" } as const;

export function SpeechBubbles({ state, labels }: { state: HumanState; labels: HumanLabels }) {
  const bubble = (key: "problem" | "hello" | "thanks", who: string, text: string, agent = false) => {
    const on = state.talk === key;
    return (
      <div
        key={key}
        className={cn(
          "story-bubble absolute max-w-[32cqw] rounded-[1.4cqw] px-[1.3cqw] py-[1cqw] transition-[opacity,translate] duration-500 @max-[560px]:max-w-[50cqw] @max-[560px]:rounded-[3cqw] @max-[560px]:px-[3cqw] @max-[560px]:py-[2cqw]",
          agent ? "bg-holo-100 text-ink-900 shadow-[0_0_0_1px_rgba(140,196,255,0.7),0_8px_30px_-6px_rgba(90,168,245,0.7)]" : "bg-paper-50 text-ink-900 shadow-soft",
          TAIL[key] === "right" ? "story-bubble--right" : "story-bubble--left",
          `story-bubble--${key}`,
          on ? "translate-y-0 opacity-100" : "translate-y-[0.6cqw] opacity-0",
        )}
      >
        <span className={cn("block font-mono text-[max(9px,0.72cqw)] tracking-[0.14em] uppercase @max-[560px]:text-[max(9px,2.2cqw)]", agent ? "text-(--blue-700)" : "text-ink-500")}>
          {who}
        </span>
        <span className="mt-[0.3cqw] block text-[max(11px,1.12cqw)] leading-snug font-semibold @max-[560px]:text-[max(11px,3.2cqw)]">{text}</span>
      </div>
    );
  };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {bubble("problem", labels.guest, labels.sayProblem)}
      {bubble("hello", labels.reception, labels.sayHello, true)}
      {bubble("thanks", labels.guest, labels.sayThanks)}
    </div>
  );
}

const PHOTO = "/images/story/receptionist-hub.jpg";

/** The person behind the hologram: overlay card on the desktop stage, or inline in the mobile step. */
export function HumanCard({ labels, show = true, variant }: { labels: HumanLabels; show?: boolean; variant: "overlay" | "inline" }) {
  if (variant === "inline")
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-mist-raised/80 p-3 ring-1 ring-holo-400/50 shadow-[0_8px_28px_-10px_rgba(47,127,208,0.45)]">
        <Image src={PHOTO} alt="" width={96} height={96} sizes="48px" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        <p className="text-body-sm leading-snug">
          <span className="block font-semibold text-ink-900">{labels.cardTitle}</span>
          <span className="text-ink-700">{labels.cardBody}</span>
        </p>
      </div>
    );
  return (
    <div
      aria-hidden
      className={cn(
        "absolute top-[12%] right-[3%] flex w-[27cqw] items-center gap-[1cqw] rounded-[1.4cqw] bg-paper-50/95 p-[0.9cqw] pr-[1.4cqw] shadow-[0_0_0_1px_rgba(140,196,255,0.55),0_10px_36px_-8px_rgba(90,168,245,0.65)] transition-[opacity,translate] duration-700",
        show ? "translate-y-0 opacity-100" : "translate-y-[0.8cqw] opacity-0",
      )}
    >
      <Image src={PHOTO} alt="" width={160} height={160} sizes="80px" className="h-[5.2cqw] w-[5.2cqw] shrink-0 rounded-[1cqw] object-cover" />
      <span className="min-w-0">
        <span className="flex items-center gap-[0.5cqw] font-mono text-[max(9px,0.72cqw)] tracking-[0.14em] text-(--blue-700) uppercase">
          <span className="live-dot !h-[0.55cqw] !w-[0.55cqw]" />
          {labels.cardTitle}
        </span>
        <span className="mt-[0.3cqw] block text-[max(11px,1.05cqw)] leading-snug font-semibold text-ink-900">{labels.cardBody}</span>
      </span>
    </div>
  );
}
