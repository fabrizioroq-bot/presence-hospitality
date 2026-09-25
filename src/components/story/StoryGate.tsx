"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { StoryLabels } from "./StoryPinned";
import { STEPS } from "./layout";

const StoryPinned = dynamic(() => import("./StoryPinned").then((m) => m.StoryPinned), { ssr: false });

/**
 * Loads the pinned story only on desktop with motion allowed, so phones never download it.
 * A same-height placeholder keeps the page length stable (no layout shift, anchors stay correct).
 */
export function StoryGate({ labels }: { labels: StoryLabels }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const update = () => setOn(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);
  if (!on) return <div aria-hidden style={{ height: `${STEPS * 100 + 40}svh` }} />;
  return <StoryPinned labels={labels} />;
}
