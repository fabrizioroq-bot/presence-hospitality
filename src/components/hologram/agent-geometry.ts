import * as THREE from "three";
import { fetchBin } from "@/lib/bin-cache";

// Must match BOUNDS in scripts/generate-agent-points.ts.
const MIN = [-0.6, 0, -0.6];
const MAX = [0.6, 1.9, 0.6];
const STRIDE = 8;

/** Fetches a quantised point file and decodes the first `count` points. */
export async function loadAgentGeometry(url: string, count: number) {
  const buf = await fetchBin(url);
  const view = new DataView(buf);
  const n = Math.min(count, Math.floor(buf.byteLength / STRIDE));
  const pos = new Float32Array(n * 3);
  const rnd = new Float32Array(n);
  const flags = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * STRIDE;
    for (let a = 0; a < 3; a++) {
      pos[i * 3 + a] = MIN[a] + (view.getUint16(o + a * 2, true) / 65535) * (MAX[a] - MIN[a]);
    }
    rnd[i] = view.getUint8(o + 6) / 255;
    flags[i] = view.getUint8(o + 7);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 1));
  g.setAttribute("aFlags", new THREE.BufferAttribute(flags, 1));
  return g;
}
