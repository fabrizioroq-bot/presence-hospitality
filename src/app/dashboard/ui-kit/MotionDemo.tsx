"use client";

import { useState } from "react";
import { DURATION, EASING } from "@/lib/motion-tokens";

const ROWS = [
  ["fast · out", DURATION.fast, EASING.out],
  ["base · out", DURATION.base, EASING.out],
  ["slow · out", DURATION.slow, EASING.out],
  ["scene · in-out", DURATION.scene, EASING.inOut],
] as const;

/** Replays each duration/easing pair on a dot (transform only; reduced motion shows the end state). */
export function MotionDemo() {
  const [isOn, setIsOn] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setIsOn((v) => !v)}
        className="self-start rounded-pill bg-paper-50 px-5 py-2.5 text-body-sm font-semibold text-night-900"
      >
        Replay
      </button>
      <div className="flex flex-col gap-3">
        {ROWS.map(([label, ms, ease]) => (
          <div key={label} className="flex items-center gap-4">
            <span className="w-48 shrink-0 font-mono text-[0.8125rem] text-paper-300">
              {label} {ms}ms
            </span>
            <span className="relative h-3 flex-1 rounded-pill bg-night-800 [container-type:inline-size]">
              <span
                aria-hidden
                className="absolute top-0 left-0 h-3 w-3 rounded-pill bg-paper-50"
                style={{
                  transform: isOn ? "translateX(calc(100cqw - 0.75rem))" : "none",
                  transition: `transform ${ms}ms cubic-bezier(${ease.join(",")})`,
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
