/**
 * Tiny animation toolkit replacing Motion on the client (keeps ~35 KB gz out of every page):
 * an observable value, scroll-progress tracking (Motion's `useScroll` offsets), a spring, and
 * piecewise-linear interpolation. Everything writes to the DOM directly; nothing re-renders React.
 */

/** Observable number (the subset of Motion's MotionValue we use). */
export class Value {
  private v: number;
  private subs = new Set<(v: number) => void>();
  constructor(v = 0) {
    this.v = v;
  }
  get() {
    return this.v;
  }
  set(v: number) {
    if (v === this.v) return;
    this.v = v;
    this.subs.forEach((cb) => cb(v));
  }
  on(cb: (v: number) => void) {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }
}
export type Readable = { get(): number };

// ---- scroll progress (same offset syntax as Motion: "<target edge> <viewport edge>") ----
const EDGE: Record<string, number> = { start: 0, center: 0.5, end: 1 };
const edge = (x: string) => (x in EDGE ? EDGE[x] : parseFloat(x));
const parse = (o: string): [number, number] => {
  const [a, b = a] = o.split(" ");
  return [edge(a), edge(b)];
};
export type Offset = [string, string];
type Sub = { el: Element; a: [number, number]; b: [number, number]; cb: (v: number) => void; last: number };
const subs = new Set<Sub>();
let raf = 0;
let bound = false;
/** Layout position (ignores CSS transforms, so parallaxed elements don't feed back into their own progress). */
const layoutBox = (el: Element) => {
  if (!(el instanceof HTMLElement)) {
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  }
  let top = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
  return { top, height: el.offsetHeight };
};
const measure = () => {
  raf = 0;
  const vh = window.innerHeight;
  const sy = window.scrollY;
  subs.forEach((s) => {
    const box = layoutBox(s.el);
    const r = { top: box.top - sy, height: box.height };
    const d0 = r.top + s.a[0] * r.height - s.a[1] * vh;
    const d1 = r.top + s.b[0] * r.height - s.b[1] * vh;
    const span = d1 - d0;
    const v = span <= 0 ? (d0 <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -d0 / span));
    if (v !== s.last) {
      s.last = v;
      s.cb(v);
    }
  });
};
const schedule = () => {
  if (!raf) raf = requestAnimationFrame(measure);
};

/** Calls `cb(progress 0..1)` whenever the element's scroll progress changes. Returns an unsubscribe. */
export function trackScroll(el: Element, offset: Offset, cb: (v: number) => void) {
  const s: Sub = { el, a: parse(offset[0]), b: parse(offset[1]), cb, last: -1 };
  subs.add(s);
  if (!bound) {
    bound = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    new ResizeObserver(schedule).observe(document.documentElement);
  }
  schedule();
  return () => {
    subs.delete(s);
  };
}

/** Piecewise-linear map of `v` from `input` stops to `output` stops (clamped). */
export function interp(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (v <= input[i]) {
      const t = (v - input[i - 1]) / (input[i] - input[i - 1] || 1);
      return output[i - 1] + (output[i] - output[i - 1]) * t;
    }
  }
  return output[output.length - 1];
}

/** A damped spring towards `set(target)`; `onUpdate` runs every frame while it moves. */
export function spring(onUpdate: (v: number) => void, { stiffness = 120, damping = 30, mass = 0.4 } = {}) {
  let x = 0;
  let vel = 0;
  let target = 0;
  let id = 0;
  let last = 0;
  const step = (t: number) => {
    // rAF timestamps can precede the performance.now() taken in set(): clamp dt to a sane range.
    const dt = last ? Math.min(0.1, Math.max(1 / 240, (t - last) / 1000)) : 1 / 60;
    last = t;
    // Semi-implicit Euler in ≤ 1/120 s sub-steps (stable for stiff springs and long frames).
    const n = Math.ceil(dt * 120);
    const h = dt / n;
    for (let k = 0; k < n; k++) {
      vel += ((-stiffness * (x - target) - damping * vel) / mass) * h;
      x += vel * h;
    }
    if (Math.abs(vel) < 0.01 && Math.abs(x - target) < 0.01) {
      x = target;
      vel = 0;
      id = 0;
    } else id = requestAnimationFrame(step);
    onUpdate(x);
  };
  return {
    set(v: number) {
      target = v;
      if (!id) {
        last = 0;
        id = requestAnimationFrame(step);
      }
    },
    get: () => x,
    stop() {
      cancelAnimationFrame(id);
      id = 0;
    },
  };
}
