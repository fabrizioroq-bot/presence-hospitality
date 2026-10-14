/* GLSL for the pitch stage. Colours are mixed in linear space; <colorspace_fragment> converts to the
   output colour space, and grain/dither is added after it so it never bands on projectors.
   Materials that take part in the before/after split include three's clipping chunks. */

const NOISE = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}`;

export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/** Soft orbs on slow, incommensurate Lissajous paths + a noise-edged light/dark dissolve. */
export const orbsFragment = /* glsl */ `
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uMotion;
uniform float uTone;
uniform vec3 uOrb[4];   // xy = centre (UV), z = radius
uniform vec3 uCol[4];
uniform vec3 uMist;
uniform vec3 uCharcoal;
${NOISE}
vec3 field(vec2 uv, vec3 base, float strength) {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * uMotion;
  p += 0.035 * vec2(noise(p * 1.4 + t * 0.04), noise(p * 1.4 + 7.3 - t * 0.03));
  vec3 col = base;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(uOrb[i].x * aspect, uOrb[i].y);
    c += 0.06 * vec2(sin(t * (0.11 + fi * 0.023) + fi * 1.7), cos(t * (0.09 + fi * 0.019) + fi * 2.3));
    float d = length(p - c) / uOrb[i].z;
    col = mix(col, uCol[i], exp(-d * d * 1.6) * strength);
  }
  return col;
}
void main() {
  vec3 light = field(vUv, uMist, 0.8);
  vec3 dark = field(vUv, uCharcoal, 0.3);
  float edge = noise(vUv * vec2(uRes.x / uRes.y, 1.0) * 2.6 + 3.1);
  float m = smoothstep(edge - 0.07, edge + 0.07, uTone * 1.16 - 0.08);
  gl_FragColor = vec4(mix(light, dark, m), 1.0);
  #include <colorspace_fragment>
  gl_FragColor.rgb += (hash(vUv * uRes + fract(uTime * uMotion) * 97.0) - 0.5) * 0.03;
}`;

/** Plane vertex with clipping support (before/after split). */
export const planeVertex = /* glsl */ `
#include <clipping_planes_pars_vertex>
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;

/**
 * Holobox screen. Power: dark glass → scan band (0–0.5) → flicker (0.5–0.68) → steady glow + Call ring.
 * uStage → dark interior with a soft emitter glow, so the receptionist reads. uRipple 0..1: Call press.
 */
export const screenFragment = /* glsl */ `
#include <clipping_planes_pars_fragment>
varying vec2 vUv;
uniform float uPower;
uniform float uStage;
uniform float uRipple;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uDark;
float flickerHash(float x) { return fract(sin(x * 91.7) * 43758.5453); }
void main() {
  #include <clipping_planes_fragment>
  float sweep = clamp(uPower * 2.0, 0.0, 1.0);
  float head = 1.0 - sweep;
  float band = smoothstep(0.05, 0.0, abs(vUv.y - head)) * step(0.001, sweep) * (1.0 - step(0.999, sweep));
  float trail = smoothstep(head - 0.01, head + 0.01, vUv.y);
  float on = smoothstep(0.5, 1.0, uPower);
  float flicker = (uPower > 0.5 && uPower < 0.68) ? step(0.4, flickerHash(floor(uTime * 24.0))) : 1.0;
  vec3 glow = mix(uBottom, uTop, vUv.y);
  float vignette = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x) * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  float scan = 0.95 + 0.05 * sin(vUv.y * 420.0 + uTime * 2.0);
  vec3 idle = mix(uDark, glow * 0.3, trail * 0.4 * (1.0 - on));
  idle = mix(idle, glow * (0.55 + 0.45 * vignette) * scan, on * flicker);
  idle += band * 0.8 * (1.0 - on);
  vec3 interior = uDark + uBottom * 0.35 * smoothstep(0.3, 0.0, vUv.y) + uTop * 0.06;
  vec3 col = mix(idle, interior, uStage);

  vec2 q = (vUv - vec2(0.5, 0.12)) * vec2(1.0, 2.26);
  float r = length(q);
  float ring = smoothstep(0.07, 0.06, r) - smoothstep(0.052, 0.042, r);
  float press = uRipple >= 0.0 ? smoothstep(0.25, 0.0, uRipple) : 0.0;
  col = mix(col, vec3(1.0), ring * on * (0.9 - 0.5 * uStage));
  col = mix(col, uTop, smoothstep(0.05, 0.0, r) * press);
  if (uRipple >= 0.0) {
    for (int i = 0; i < 2; i++) {
      float p = fract(uRipple + float(i) * 0.5);
      float wave = smoothstep(0.014, 0.0, abs(r - (0.07 + p * 0.5))) * (1.0 - p);
      col = mix(col, vec3(1.0), wave * 0.8);
    }
  }
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}`;

/** A soft radial pool: contact shadow, floor glow or halo (uAspect stretches it). */
export const poolFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
uniform float uStrength;
uniform float uOpacity;
uniform float uAspect;
void main() {
  float d = length((vUv - 0.5) * vec2(1.0, uAspect));
  gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * uStrength * uOpacity);
  #include <colorspace_fragment>
}`;

/** Lobby wall: light panels with fine seams, fading out at the edges into the orb atmosphere. */
export const wallFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
uniform vec3 uSeam;
uniform float uOpacity;
uniform float uPanels;
void main() {
  float seam = smoothstep(0.004, 0.0, abs(fract(vUv.x * uPanels) - 0.5) - 0.497);
  vec3 col = mix(uColor, uSeam, seam * 0.6);
  col *= 0.93 + 0.07 * smoothstep(0.0, 0.6, vUv.y);
  float fade = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(1.0, 0.75, vUv.y) * smoothstep(0.0, 0.04, vUv.y);
  gl_FragColor = vec4(col, fade * uOpacity);
  #include <colorspace_fragment>
}`;

/** Kiosk screen: a light interface with a header band (the left kiosk's checklist is real DOM on top). */
export const kioskScreenFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 uBg;
uniform vec3 uHeader;
uniform float uOpacity;
void main() {
  vec3 col = uBg;
  col = mix(col, uHeader, step(0.86, vUv.y));
  float rows = step(0.5, fract(vUv.y * 9.0)) * step(0.15, vUv.y) * step(vUv.y, 0.75) * step(0.12, vUv.x) * step(vUv.x, 0.88);
  col = mix(col, uHeader, rows * 0.12);
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}`;

/** The receptionist's points (vertex shader shared with the site's hologram); no portal clip here. */
export const agentPointFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.0, d));
}`;
