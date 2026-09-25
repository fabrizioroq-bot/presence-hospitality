"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useRef } from "react";
import { MistOrbs, type Orb } from "@/components/brand/MistOrbs";
import { cn } from "@/lib/cn";

/** MistOrbs that drift with scroll (±range px) on top of their CSS drift. */
export function ParallaxOrbs({ orbs, range = 70, className }: { orbs: Orb[]; range?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <m.div style={{ y }} className="absolute -inset-y-[80px] inset-x-0 motion-reduce:!transform-none">
        <MistOrbs orbs={orbs} />
      </m.div>
    </div>
  );
}
