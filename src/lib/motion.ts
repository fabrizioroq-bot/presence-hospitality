import type { Transition, Variants } from "motion/react";

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const dur = { fast: 0.15, base: 0.25, slow: 0.4, reveal: 0.7, hero: 1.2 } as const;

export const spring: Transition = { type: "spring", stiffness: 260, damping: 30 };

export const reveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: dur.reveal, ease: ease.out },
  },
};

/** Rise + unblur without opacity — the element is painted from the first frame. */
export const revealSoft: Variants = {
  hidden: { y: 16, filter: "blur(6px)" },
  show: { y: 0, filter: "blur(0px)", transition: { duration: dur.reveal, ease: ease.out } },
};

export const stagger = (s = 0.07): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: s } },
});

export const inView = { once: true, amount: 0.3 } as const;
