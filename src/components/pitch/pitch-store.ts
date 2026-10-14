"use client";

import { useSyncExternalStore } from "react";
import type { Position } from "./chapters";

/**
 * The presenter position, shared by the DOM shell and the WebGL stage. The stage reads `getPitch()`
 * every frame (no React re-render); components subscribe with `usePitch()`.
 */
export type PitchState = Position & {
  /** Increments on every move, so the stage can tell forward from back. */
  seq: number;
  direction: 1 | -1;
};

let state: PitchState = { chapter: 0, step: 0, seq: 0, direction: 1 };
const subs = new Set<() => void>();

export const getPitch = () => state;

export function setPitch(pos: Position) {
  if (pos.chapter === state.chapter && pos.step === state.step) return;
  const forward = pos.chapter > state.chapter || (pos.chapter === state.chapter && pos.step > state.step);
  state = { ...pos, seq: state.seq + 1, direction: forward ? 1 : -1 };
  subs.forEach((cb) => cb());
}

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
};

const serverState: PitchState = { chapter: 0, step: 0, seq: 0, direction: 1 };

export function usePitch(): PitchState {
  return useSyncExternalStore(subscribe, getPitch, () => serverState);
}
