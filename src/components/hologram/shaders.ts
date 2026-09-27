// GLSL for the hero scene. All colours are sRGB values of the design tokens (no tone mapping).

/** Rounded-rect clip shared by every pass: uRect = (x, y, w, h) in device px, origin bottom-left. */
const clip = /* glsl */ `
uniform vec4 uRect;
uniform float uRadius;
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float portalDist(vec2 frag) {
  return sdRoundRect(frag - (uRect.xy + uRect.zw * 0.5), uRect.zw * 0.5, uRadius);
}
`;

const noise = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

// ---------------------------------------------------------------------------
// Background: light fog in the orb colours + mouse light + the Holobox panel.
// ---------------------------------------------------------------------------
export const fogVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const fogFragment = /* glsl */ `
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;     // -1..1, smoothed
uniform vec2 uMousePx;   // device px, bottom-left origin
uniform float uScroll;   // 0..1 hero progress
uniform float uPR;
uniform float uTextFade; // 1 on desktop: calmer fog behind the text column
${clip}
${noise}
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes.y;
  float t = uTime * 0.022;
  vec2 drift = vec2(t, t * 0.55) + uMouse * vec2(-0.05, 0.035) + vec2(0.0, -uScroll * 0.55);

  float n1 = fbm(uv * 1.25 + drift);
  float n2 = fbm(uv * 2.0 - drift * 1.4 + n1 * 0.9);

  vec3 sky = vec3(0.553, 0.702, 0.875);
  vec3 mint = vec3(0.745, 0.902, 0.855);
  vec3 lav = vec3(0.839, 0.776, 0.894);
  vec3 peach = vec3(0.945, 0.780, 0.639);

  vec3 col = mix(sky, lav, smoothstep(0.3, 0.72, n2));
  col = mix(col, mint, smoothstep(0.55, 0.8, n1) * 0.6);
  col = mix(col, peach, smoothstep(0.55, 0.85, n1 * n2 * 2.0) * 0.55);
  float a = smoothstep(0.34, 0.88, n1 * 0.62 + n2 * 0.62) * 0.34;

  // Calmer area behind the text column (left 45%) for legibility.
  a *= mix(1.0, mix(0.45, 1.0, smoothstep(0.25, 0.6, frag.x / uRes.x)), uTextFade);

  // Soft light that follows the mouse.
  float md = length(frag - uMousePx) / (uRes.y * 0.35);
  float light = exp(-md * md) * 0.10;
  col = mix(col, vec3(0.95, 0.97, 1.0), light / max(a + light, 0.001));
  a += light;

  // Fade out as the hero scrolls away.
  a *= 1.0 - smoothstep(0.55, 1.0, uScroll) * 0.6;

  // Holobox panel.
  float d = portalDist(frag);
  float inside = 1.0 - smoothstep(-uPR, uPR, d);
  vec2 pu = (frag - uRect.xy) / uRect.zw;
  vec3 panel = vec3(0.071, 0.078, 0.090);
  panel += vec3(0.184, 0.498, 0.816) * 0.30 * exp(-dot((pu - vec2(0.5, -0.02)) * vec2(1.2, 2.0), (pu - vec2(0.5, -0.02)) * vec2(1.2, 2.0)) * 2.2);
  panel += vec3(0.549, 0.769, 1.0) * 0.045 * exp(-dot(pu - vec2(0.5, 0.58), pu - vec2(0.5, 0.58)) * 3.0);
  // faint glass-case edges
  float edge = exp(-pow((abs(pu.x - 0.5) - 0.36) * 160.0, 2.0)) * smoothstep(0.02, 0.2, pu.y) * smoothstep(0.98, 0.8, pu.y);
  panel += vec3(0.549, 0.769, 1.0) * edge * 0.10;

  gl_FragColor = vec4(mix(col, panel, inside), mix(a, 1.0, inside));
}
`;

// ---------------------------------------------------------------------------
// Drifting particle field (far layers sit behind the Holobox, near bokeh in front).
// aData = (x, y, depth, random), x/y in 0..1.
// ---------------------------------------------------------------------------
export const fieldVertex = /* glsl */ `
attribute vec4 aData;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uPR;
uniform float uBokeh;
varying float vAlpha;
varying float vWarm;
varying float vSoft;
void main() {
  float depth = aData.z;
  float r = aData.w;
  vec2 p = aData.xy;
  float par = uBokeh > 0.5 ? 1.8 : (0.25 + depth);
  p.y += uTime * (0.003 + depth * 0.009);
  p.x += sin(uTime * 0.18 + r * 40.0) * 0.012 * depth;
  p += uMouse * vec2(-0.012, 0.01) * par;
  p.y += uScroll * 0.35 * par;
  p = fract(p);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  if (uBokeh > 0.5) {
    gl_PointSize = (22.0 + r * 34.0) * uPR;
    vAlpha = 0.10 + 0.08 * sin(uTime * 0.4 + r * 30.0);
    vSoft = 1.0;
  } else {
    gl_PointSize = (1.4 + depth * 2.6) * uPR;
    vAlpha = (0.22 + 0.45 * depth) * (0.65 + 0.35 * sin(uTime * (0.6 + r) + r * 20.0));
    vSoft = 0.0;
  }
  vWarm = step(0.94, r);
}
`;

export const fieldFragment = /* glsl */ `
uniform float uBokeh;
varying float vAlpha;
varying float vWarm;
varying float vSoft;
${clip}
void main() {
  // Far particles are behind the Holobox glass.
  if (uBokeh < 0.5 && portalDist(gl_FragCoord.xy) < 0.0) discard;
  float d = length(gl_PointCoord - 0.5);
  float a = vSoft > 0.5 ? smoothstep(0.5, 0.0, d) * smoothstep(0.5, 0.3, d) : smoothstep(0.5, 0.15, d);
  vec3 cool = uBokeh > 0.5 ? vec3(0.902, 0.949, 1.0) : vec3(0.353, 0.659, 0.961);
  vec3 col = mix(cool, vec3(0.961, 0.663, 0.290), vWarm);
  gl_FragColor = vec4(col, a * vAlpha);
}
`;

// ---------------------------------------------------------------------------
// Hologram agent points.
// ---------------------------------------------------------------------------
export const agentVertex = /* glsl */ `
attribute float aRandom;
attribute float aFlags;
uniform float uTime;
uniform float uProgress;
uniform float uSize;
uniform float uPR;
uniform float uFlicker;
uniform float uGlitchY;
uniform float uGlitchAmt;
uniform float uSweep;
uniform vec3 uPointer;
uniform float uPointerOn;
uniform float uMotion; // 0 when reduced motion
uniform float uDissolve; // 0..1 as the hero scrolls away
uniform float uNod;      // greeting: head nod angle (rad), upper body bows a little with it
uniform float uTilt;     // greeting: friendly sideways head tilt (rad)
uniform float uGreet;    // greeting glow 0..1
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec3 target = position;
  float warm = mod(aFlags, 2.0);
  float interior = step(1.5, mod(aFlags, 4.0));
  float orbit = step(3.5, aFlags);

  // Formation: particles rise from the emitter beam into the body, feet first.
  float delay = clamp(target.y / 1.9, 0.0, 1.0) * 0.85 + aRandom * 0.15;
  float t = smoothstep(delay * 0.6, delay * 0.6 + 0.4, uProgress);
  float ang = aRandom * 6.2831 * 7.0;
  float rr = 0.08 * fract(aRandom * 13.7);
  vec3 start = vec3(cos(ang) * rr, fract(aRandom * 31.3) * 1.9, sin(ang) * rr);
  vec3 p = mix(start, target, t);
  p += (1.0 - t) * 0.15 * vec3(sin(p.y * 8.0 + uTime * 2.0), 0.0, cos(p.y * 8.0 + uTime * 2.0));

  // Greeting: a small bow from the waist plus a nod from the neck (rotation about x, towards camera).
  if (orbit < 0.5 && uNod > 0.0) {
    float wb = smoothstep(0.95, 1.45, target.y);
    float ab = uNod * 0.22 * wb;
    vec2 yz = vec2(p.y - 0.95, p.z);
    p.y = 0.95 + yz.x * cos(ab) - yz.y * sin(ab);
    p.z = yz.y * cos(ab) + yz.x * sin(ab);
    float wh = smoothstep(1.44, 1.53, target.y);
    float ah = uNod * wh;
    float py = 1.49 + (0.95 - 1.49) * (1.0 - cos(ab)); // neck pivot follows the bow (approx.)
    yz = vec2(p.y - py, p.z);
    p.y = py + yz.x * cos(ah) - yz.y * sin(ah);
    p.z = yz.y * cos(ah) + yz.x * sin(ah);
    float at = uTilt * wh;
    vec2 xy = vec2(p.x, p.y - py);
    p.x = xy.x * cos(at) - xy.y * sin(at);
    p.y = py + xy.x * sin(at) + xy.y * cos(at);
  }

  // Orbit dust circles slowly.
  if (orbit > 0.5) {
    float a = uTime * 0.12 * uMotion;
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
  }

  // Breathing + jitter.
  p.y *= 1.0 + 0.004 * sin(uTime * 1.2) * uMotion;
  p += 0.0025 * uMotion * vec3(sin(uTime * 3.0 + aRandom * 50.0), cos(uTime * 2.7 + aRandom * 40.0), 0.0);

  // Glitch slice.
  p.x += step(abs(p.y - uGlitchY), 0.03) * uGlitchAmt;

  // Dissolve into rising dust (carried into the next scenes).
  float dz = smoothstep(0.0, 1.0, uDissolve * (0.6 + aRandom * 0.8));
  p += dz * vec3(sin(aRandom * 91.0) * 0.6, 0.9 + aRandom * 1.2, cos(aRandom * 57.0) * 0.4);

  // Pointer repel.
  vec2 dp = p.xy - uPointer.xy;
  float f = uPointerOn * smoothstep(0.2, 0.0, length(dp));
  p.xy += normalize(dp + 1e-5) * f * 0.006;
  p.z += f * 0.04;

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float band = smoothstep(0.06, 0.0, abs(p.y - uSweep)) * uMotion;
  gl_PointSize = uSize * uPR * (4.0 / -mv.z) * (1.0 + band * 0.35) * (orbit > 0.5 ? 0.8 : 1.0);

  // Fresnel from the body axis.
  vec3 nW = normalize(mat3(modelMatrix) * normalize(vec3(p.x, 0.0, p.z) + 1e-5));
  vec3 V = normalize(cameraPosition - world.xyz);
  float rim = 1.0 - abs(dot(nW, V));
  vec3 core = vec3(0.549, 0.769, 1.0);
  vec3 hi = vec3(0.902, 0.949, 1.0);
  vec3 col = mix(core, hi, pow(rim, 2.0) * 0.85);
  col = mix(col, vec3(0.961, 0.663, 0.290), warm);
  vColor = col;

  float scan = 0.78 + 0.22 * sin(p.y * 140.0 + uTime * 3.0 * uMotion);
  float alpha = (0.5 + 0.2 * rim) * scan * uFlicker * (0.35 + 0.65 * t) + band * 0.5 + uGreet * 0.18;
  alpha += f * 0.35;
  alpha *= 1.0 - dz;
  alpha *= interior > 0.5 ? 0.6 : 1.0;
  alpha *= orbit > 0.5 ? 0.3 * t : 1.0;
  vAlpha = alpha;
}
`;

export const agentFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
${clip}
void main() {
  if (portalDist(gl_FragCoord.xy) > 0.0) discard;
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, vAlpha * a);
}
`;

// ---------------------------------------------------------------------------
// Volumetric light cone above the emitter.
// ---------------------------------------------------------------------------
export const coneVertex = /* glsl */ `
varying float vY;
varying vec3 vN;
varying vec3 vV;
varying float vAng;
void main() {
  vY = position.y + 1.0; // geometry is centred; 0..2
  vAng = atan(position.z, position.x);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const coneFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
varying float vY;
varying vec3 vN;
varying vec3 vV;
varying float vAng;
${clip}
void main() {
  if (portalDist(gl_FragCoord.xy) > 0.0) discard;
  float h = clamp(vY / 2.0, 0.0, 1.0);
  float a = pow(1.0 - h, 1.6) * 0.2;
  a *= pow(abs(dot(vN, vV)), 1.4);
  float streak = 0.7 + 0.3 * sin(vAng * 11.0 + uTime * 0.35) * sin(vY * 2.4 - uTime * 0.6);
  a *= streak * uIntensity;
  gl_FragColor = vec4(0.549, 0.769, 1.0, a);
}
`;

// ---------------------------------------------------------------------------
// Emitter base: concentric rings pulsing outward + amber hairline at the rim.
// ---------------------------------------------------------------------------
export const ringsVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ringsFragment = /* glsl */ `
uniform float uTime;
uniform float uMotion;
uniform float uIntensity;
varying vec2 vUv;
${clip}
void main() {
  if (portalDist(gl_FragCoord.xy) > 0.0) discard;
  float r = length(vUv - 0.5) * 2.0; // 0..1 → radius 0..0.5
  float a = 0.0;
  for (int k = 0; k < 3; k++) {
    float ph = fract(uTime / 2.2 * uMotion + float(k) / 3.0);
    a += smoothstep(0.018, 0.0, abs(r - ph * 0.92)) * (1.0 - ph) * 0.55;
  }
  a += smoothstep(0.012, 0.0, abs(r - 0.62)) * 0.35;
  a += smoothstep(0.012, 0.0, abs(r - 0.9)) * 0.4;
  a += smoothstep(0.45, 0.0, r) * 0.12;
  vec3 col = vec3(0.549, 0.769, 1.0);
  float amber = smoothstep(0.008, 0.0, abs(r - 0.965));
  col = mix(col, vec3(0.961, 0.663, 0.290), amber);
  a += amber * 0.5;
  a *= smoothstep(1.0, 0.97, r) * uIntensity;
  gl_FragColor = vec4(col, a);
}
`;

// ---------------------------------------------------------------------------
// Story: morphing points (lobby lines + guest). Assemble from dust (uForm), dissolve upward.
// ---------------------------------------------------------------------------
export const morphVertex = /* glsl */ `
attribute vec3 aScatter;
attribute float aRand;
attribute float aTone;
attribute float aFade;
uniform float uForm;
uniform float uDissolve;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform float uAlpha;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uWalk;    // gait phase (radians)
uniform float uWalking; // 0..1
uniform float uHipY;    // hip height in local units (legs below it swing)
uniform float uLegX;    // half-width that counts as a leg
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = aRand * 0.45;
  float t = smoothstep(d, d + 0.55, uForm);
  vec3 base = position;
  // Walking: legs swing around the hip (skip the suitcase, tone 1).
  if (uWalking > 0.0 && aTone < 0.5 && base.y < uHipY && abs(base.x) < uLegX) {
    float side = base.x < 0.0 ? -1.0 : 1.0;
    float a = sin(uWalk) * 0.34 * side * uWalking;
    vec2 hip = vec2(side * uLegX * 0.45, uHipY);
    vec2 q = base.xy - hip;
    base.xy = hip + vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a));
  }
  vec3 p = base + aScatter * (1.0 - t);
  p += (1.0 - t) * 0.25 * vec3(sin(uTime * 0.7 + aRand * 40.0), cos(uTime * 0.6 + aRand * 30.0), 0.0);
  p += 0.012 * vec3(sin(uTime * 1.3 + aRand * 60.0), cos(uTime * 1.1 + aRand * 70.0), 0.0);
  float dz = smoothstep(0.0, 1.0, uDissolve * (0.6 + aRand * 0.8));
  p += dz * vec3(sin(aRand * 91.0) * 1.2, 1.2 + aRand * 2.5, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * uPR * (0.8 + aRand * 0.5);
  vColor = mix(uColorA, uColorB, aTone);
  vAlpha = uAlpha * aFade * (0.25 + 0.75 * t) * (1.0 - dz) * (0.85 + 0.15 * sin(uTime * 2.0 + aRand * 20.0));
}
`;

export const morphFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.1, d));
}
`;

// Call stream: particles travelling along a quadratic curve from the Holobox to the hub.
export const flowVertex = /* glsl */ `
attribute float aT;
attribute float aRand;
uniform float uTime;
uniform float uFlow;
uniform float uPR;
uniform vec2 uFrom;
uniform vec2 uCtrl;
uniform vec2 uTo;
varying float vAlpha;
varying float vWarm;
void main() {
  float t = fract(aT + uTime * 0.22);
  vec2 a = mix(uFrom, uCtrl, t);
  vec2 b = mix(uCtrl, uTo, t);
  vec2 p = mix(a, b, t);
  vec2 tan = normalize(b - a);
  p += vec2(-tan.y, tan.x) * (aRand - 0.5) * 0.18;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = (2.0 + aRand * 3.0) * uPR;
  vAlpha = uFlow * sin(3.14159 * t) * (0.5 + 0.5 * aRand);
  vWarm = step(0.86, aRand);
}
`;

export const flowFragment = /* glsl */ `
varying float vAlpha;
varying float vWarm;
void main() {
  float d = length(gl_PointCoord - 0.5);
  vec3 col = mix(vec3(0.749, 0.878, 1.0), vec3(0.961, 0.663, 0.290), vWarm);
  gl_FragColor = vec4(col, vAlpha * smoothstep(0.5, 0.1, d));
}
`;

// Holobox interior glow (rounded rect, brighter as the agent appears).
export const glowVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragment = /* glsl */ `
uniform float uLevel;
uniform vec2 uSize;
varying vec2 vUv;
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdRoundRect(p, uSize * 0.5, 0.4);
  float inside = 1.0 - smoothstep(-0.02, 0.02, d);
  float g = exp(-pow((vUv.y) * 1.6, 2.0)) * 0.55 + 0.12;
  float edge = smoothstep(0.12, 0.0, abs(d)) * 0.25;
  gl_FragColor = vec4(vec3(0.184, 0.498, 0.816), (g * inside + edge) * uLevel);
}
`;
