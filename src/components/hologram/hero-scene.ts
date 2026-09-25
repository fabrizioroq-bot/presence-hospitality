import * as THREE from "three";
import { tierConfig, type Tier } from "@/lib/perf-tier";
import { loadAgentGeometry } from "./agent-geometry";
import {
  agentFragment,
  agentVertex,
  coneFragment,
  coneVertex,
  fieldFragment,
  fieldVertex,
  fogFragment,
  fogVertex,
  ringsFragment,
  ringsVertex,
} from "./shaders";

export type PointerState = { x: number; y: number; has: boolean; fine: boolean };

export type FrameInput = {
  gl: THREE.WebGLRenderer;
  width: number; // canvas CSS px
  height: number;
  time: number;
  delta: number;
  portal: HTMLElement;
  pointer: PointerState;
  scroll: number;
  setDpr: (dpr: number) => void;
};

const FORMATION_S = 2.4;
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

function makeField(count: number, bokeh: boolean) {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    data[i * 4] = Math.random();
    data[i * 4 + 1] = Math.random();
    data[i * 4 + 2] = bokeh ? 1 : Math.pow(Math.random(), 1.6);
    data[i * 4 + 3] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("aData", new THREE.BufferAttribute(data, 4));
  // Points need a position attribute for the draw count; values are unused.
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return g;
}

const additive = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending };
const normal = { transparent: true, depthTest: false, depthWrite: false };

/**
 * The hero scene: pass 1 draws fog + far particles + the Holobox panel over the whole canvas,
 * pass 2 draws the hologram into the portal viewport (clipped to its rounded rect),
 * pass 3 draws near bokeh in front.
 */
export class HeroScene {
  readonly reduced: boolean;
  private cfg: (typeof tierConfig)[Tier];
  private shared = {
    uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uRadius: { value: 48 },
    uPR: { value: 1 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uScroll: { value: 0 },
  };

  private bgScene = new THREE.Scene();
  private bokehScene = new THREE.Scene();
  private ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private fogMat: THREE.ShaderMaterial;
  private field: THREE.Points;

  private holoScene = new THREE.Scene();
  private group = new THREE.Group();
  private camera = new THREE.PerspectiveCamera(32, 0.68, 0.1, 30);
  private agentMat: THREE.ShaderMaterial;
  private agent: THREE.Points | null = null;

  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private hit = new THREE.Vector3();
  private ndc = new THREE.Vector2();
  private target = new THREE.Vector2();

  private formationStart: number | null = null;
  private rotY = 0;
  private rotX = 0;
  private nextDip = -1;
  private dipUntil = 0;
  private dipCount = 0;
  private frames = 0;
  private frameAcc = 0;
  private tierStep = 0;
  private aspect = 0;
  private radiusCss = 48;
  private disposed = false;

  constructor(tier: Tier, onLoaded: () => void) {
    this.cfg = tierConfig[tier];
    this.reduced = tier === "reduced";
    const { cfg, shared, reduced } = this;

    // ---- background ----
    this.fogMat = new THREE.ShaderMaterial({
      vertexShader: fogVertex,
      fragmentShader: fogFragment,
      defines: { OCTAVES: cfg.octaves },
      uniforms: {
        ...shared,
        uRes: { value: new THREE.Vector2(1, 1) },
        uMousePx: { value: new THREE.Vector2(-9999, -9999) },
        uTextFade: { value: 1 },
      },
      ...normal,
    });
    const fog = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fogMat);
    fog.frustumCulled = false;
    this.bgScene.add(fog);

    this.field = new THREE.Points(
      makeField(cfg.field, false),
      new THREE.ShaderMaterial({
        vertexShader: fieldVertex,
        fragmentShader: fieldFragment,
        uniforms: { ...shared, uBokeh: { value: 0 } },
        ...normal,
      }),
    );
    this.field.frustumCulled = false;
    this.bgScene.add(this.field);

    const bokeh = new THREE.Points(
      makeField(cfg.bokeh, true),
      new THREE.ShaderMaterial({
        vertexShader: fieldVertex,
        fragmentShader: fieldFragment,
        uniforms: { ...shared, uBokeh: { value: 1 } },
        ...additive,
      }),
    );
    bokeh.frustumCulled = false;
    this.bokehScene.add(bokeh);

    // ---- hologram ----
    this.holoScene.add(this.group);
    this.agentMat = new THREE.ShaderMaterial({
      vertexShader: agentVertex,
      fragmentShader: agentFragment,
      uniforms: {
        ...shared,
        uProgress: { value: reduced ? 1 : 0 },
        uSize: { value: cfg.size },
        uFlicker: { value: 1 },
        uGlitchY: { value: -10 },
        uGlitchAmt: { value: 0 },
        uSweep: { value: -10 },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPointerOn: { value: 0 },
        uMotion: { value: reduced ? 0 : 1 },
        uDissolve: { value: 0 },
      },
      ...additive,
    });

    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.5, 2, 48, 1, true),
      new THREE.ShaderMaterial({
        vertexShader: coneVertex,
        fragmentShader: coneFragment,
        uniforms: { ...shared, uIntensity: { value: 1 } },
        side: THREE.DoubleSide,
        ...additive,
      }),
    );
    cone.position.y = 1;
    cone.renderOrder = 0;
    this.group.add(cone);

    const rings = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.1),
      new THREE.ShaderMaterial({
        vertexShader: ringsVertex,
        fragmentShader: ringsFragment,
        uniforms: { ...shared, uMotion: { value: reduced ? 0 : 1 }, uIntensity: { value: 1 } },
        ...additive,
      }),
    );
    rings.rotation.x = -Math.PI / 2;
    rings.position.y = 0.002;
    rings.renderOrder = 1;
    this.group.add(rings);

    loadAgentGeometry(`/hologram/${cfg.file}`, cfg.points).then((geo) => {
      if (this.disposed) {
        geo.dispose();
        return;
      }
      this.agent = new THREE.Points(geo, this.agentMat);
      this.agent.frustumCulled = false;
      this.agent.renderOrder = 2;
      this.group.add(this.agent);
      onLoaded();
    });
  }

  get loaded() {
    return this.agent !== null;
  }

  /** Call when the portal is resized (border radius may change between breakpoints). */
  measure(portal: HTMLElement) {
    this.radiusCss = parseFloat(getComputedStyle(portal).borderTopLeftRadius) || 48;
  }

  frame(f: FrameInput) {
    const { gl, width, height, portal, pointer: p } = f;
    const { shared, reduced } = this;
    const time = f.time;
    const dt = Math.min(f.delta, 0.05);
    const pr = gl.getPixelRatio();
    if (this.nextDip < 0) this.nextDip = time + 3 + Math.random() * 4;

    // Portal rect relative to the canvas → device px, bottom-left origin.
    const cr = gl.domElement.getBoundingClientRect();
    const rr = portal.getBoundingClientRect();
    const x = rr.left - cr.left;
    const w = rr.width;
    const h = rr.height;
    const yGl = height - (rr.top - cr.top + h);
    shared.uRect.value.set(x * pr, yGl * pr, w * pr, h * pr);
    shared.uRadius.value = this.radiusCss * pr;
    shared.uPR.value = pr;
    shared.uTime.value = reduced ? 0 : time;
    shared.uScroll.value = reduced ? 0 : f.scroll;

    // Pointer, viewport-normalised and smoothed.
    const live = p.has && p.fine && !reduced;
    if (live) this.target.set((p.x / window.innerWidth) * 2 - 1, -((p.y / window.innerHeight) * 2 - 1));
    else this.target.set(0, 0);
    shared.uMouse.value.lerp(this.target, 1 - Math.pow(0.001, dt));

    const fu = this.fogMat.uniforms;
    fu.uRes.value.set(width * pr, height * pr);
    fu.uTextFade.value = width >= 1024 ? 1 : 0;
    if (live) fu.uMousePx.value.set((p.x - cr.left) * pr, (cr.bottom - p.y) * pr);
    else fu.uMousePx.value.set(-9999, -9999);

    // Frame the full figure for the portal's aspect.
    const aspect = w / Math.max(h, 1);
    if (Math.abs(aspect - this.aspect) > 0.001) {
      this.aspect = aspect;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(16));
      this.camera.aspect = aspect;
      this.camera.position.set(0, 1.0, Math.max(4.1, 0.62 / (tanHalf * aspect)));
      this.camera.lookAt(0, 0.93, 0);
      this.camera.updateProjectionMatrix();
    }

    const u = this.agentMat.uniforms;
    u.uDissolve.value = reduced ? 0 : THREE.MathUtils.smoothstep(f.scroll, 0.3, 0.85);
    if (this.agent && !reduced) {
      if (this.formationStart === null) this.formationStart = time;
      u.uProgress.value = easeOutExpo(Math.min(1, (time - this.formationStart) / FORMATION_S));
    }

    // Turn towards the pointer (mouse) or sway gently (touch).
    const over = p.has && p.x >= rr.left && p.x <= rr.right && p.y >= rr.top && p.y <= rr.bottom;
    let tY = 0;
    let tX = 0;
    if (!reduced) {
      if (p.fine && p.has) {
        tY = THREE.MathUtils.clamp((p.x - (rr.left + w / 2)) / (window.innerWidth / 2), -1, 1) * 0.28;
        tX = THREE.MathUtils.clamp((p.y - (rr.top + h / 2)) / (window.innerHeight / 2), -1, 1) * 0.06;
      } else {
        tY = Math.sin((time * Math.PI * 2) / 9) * 0.12;
      }
    }
    this.rotY += (tY - this.rotY) * 0.06;
    this.rotX += (tX - this.rotX) * 0.06;
    this.group.rotation.set(this.rotX, this.rotY, 0);

    // Pointer attention: brighten where the pointer rests on the body.
    if (over && live && this.agent) {
      this.ndc.set(((p.x - rr.left) / w) * 2 - 1, -(((p.y - rr.top) / h) * 2 - 1));
      this.raycaster.setFromCamera(this.ndc, this.camera);
      if (this.raycaster.ray.intersectPlane(this.plane, this.hit)) {
        this.group.worldToLocal(this.hit);
        u.uPointer.value.copy(this.hit);
      }
      u.uPointerOn.value += (1 - u.uPointerOn.value) * 0.1;
    } else {
      u.uPointerOn.value += (0 - u.uPointerOn.value) * 0.1;
    }

    // Flicker + glitch slice (never while the user is looking at the agent).
    if (!reduced) {
      if (time > this.nextDip && !over && u.uProgress.value >= 1) {
        this.dipUntil = time + 0.07 + Math.random() * 0.05;
        this.dipCount++;
        u.uGlitchY.value = 0.2 + Math.random() * 1.5;
        u.uGlitchAmt.value = (Math.random() > 0.5 ? 1 : -1) * 0.03;
        this.nextDip = this.dipCount % 2 === 1 ? time + 0.12 : time + 3 + Math.random() * 4;
      }
      const dipping = time < this.dipUntil;
      u.uFlicker.value = dipping ? 0.82 : 1;
      if (!dipping) u.uGlitchAmt.value = 0;
      u.uSweep.value = u.uProgress.value >= 1 ? ((time % 4.5) / 4.5) * 2.1 - 0.1 : -10;
    }

    // ---- render ----
    gl.autoClear = false;
    gl.setScissorTest(false);
    gl.setViewport(0, 0, width, height);
    gl.clear();
    gl.render(this.bgScene, this.ortho);

    gl.setViewport(x, yGl, w, h);
    gl.setScissor(x, yGl, w, h);
    gl.setScissorTest(true);
    gl.render(this.holoScene, this.camera);
    gl.setScissorTest(false);

    gl.setViewport(0, 0, width, height);
    gl.render(this.bokehScene, this.ortho);

    // Performance monitor: after formation, step down once per slow 2 s window.
    if (!reduced && u.uProgress.value >= 1) {
      this.frames++;
      this.frameAcc += f.delta;
      if (this.frameAcc >= 2) {
        const fps = this.frames / this.frameAcc;
        this.frames = 0;
        this.frameAcc = 0;
        if (fps < 45 && this.tierStep < 3) this.stepDown(f.setDpr);
      }
    }
  }

  private stepDown(setDpr: (dpr: number) => void) {
    this.tierStep++;
    if (this.tierStep === 1) setDpr(1);
    if (this.tierStep === 2) this.agent?.geometry.setDrawRange(0, Math.min(30000, this.cfg.points));
    if (this.tierStep === 3) {
      this.agent?.geometry.setDrawRange(0, 12000);
      this.field.geometry.setDrawRange(0, Math.floor(this.cfg.field / 2));
    }
  }

  dispose() {
    this.disposed = true;
    for (const scene of [this.bgScene, this.bokehScene, this.holoScene]) {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
    }
  }
}
