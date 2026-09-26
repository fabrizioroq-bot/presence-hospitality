import * as THREE from "three";
import { loadAgentGeometry } from "@/components/hologram/agent-geometry";
import {
  agentFragment,
  agentVertex,
  coneFragment,
  coneVertex,
  flowFragment,
  flowVertex,
  glowFragment,
  glowVertex,
  morphFragment,
  morphVertex,
  ringsFragment,
  ringsVertex,
} from "@/components/hologram/shaders";
import { DOOR, FLOOR, HOLOBOX, HUB, KIOSK, PERSON_SCALE, WORLD, timeline } from "./layout";

const additive = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending };
const col = (hex: string) => new THREE.Color(hex);

type Seg = { a: [number, number]; b: [number, number]; tone: number; fadeEnds?: boolean };

function rect(x0: number, y0: number, x1: number, y1: number, tone: number, open = false): Seg[] {
  const s: Seg[] = [
    { a: [x0, y0], b: [x0, y1], tone },
    { a: [x0, y1], b: [x1, y1], tone },
    { a: [x1, y1], b: [x1, y0], tone },
  ];
  if (!open) s.push({ a: [x1, y0], b: [x0, y0], tone });
  return s;
}

/** Lobby outlines as line segments (world units). tone 0 = paper, 1 = holo. */
function lobbySegments(): Seg[] {
  const k = KIOSK;
  const h = HOLOBOX;
  return [
    { a: [-WORLD.w / 2, FLOOR], b: [WORLD.w / 2, FLOOR], tone: 0, fadeEnds: true },
    ...rect(DOOR.x0, FLOOR, DOOR.x1, DOOR.y1, 0, true),
    ...rect(k.screen.x0, k.screen.y0, k.screen.x1, k.screen.y1, 0),
    ...rect(k.pole.x0, FLOOR, k.pole.x1, k.pole.y1, 0, true),
    { a: [k.base.x0, k.base.y1], b: [k.base.x1, k.base.y1], tone: 0 },
    ...rect(h.x0, FLOOR, h.x1, h.y1, 1),
    { a: [h.x0 + 0.2, h.plinth], b: [h.x1 - 0.2, h.plinth], tone: 1 },
    { a: [h.x0 + 0.2, h.cap], b: [h.x1 - 0.2, h.cap], tone: 1 },
  ];
}

function makeLobby(density: number) {
  const segs = lobbySegments();
  const pos: number[] = [];
  const scatter: number[] = [];
  const rnd: number[] = [];
  const tone: number[] = [];
  const fade: number[] = [];
  for (const s of segs) {
    const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
    const n = Math.max(2, Math.round(len * density));
    for (let i = 0; i < n; i++) {
      const u = (i + Math.random() * 0.8) / n;
      const x = s.a[0] + (s.b[0] - s.a[0]) * u + (Math.random() - 0.5) * 0.03;
      const y = s.a[1] + (s.b[1] - s.a[1]) * u + (Math.random() - 0.5) * 0.03;
      pos.push(x, y, 0);
      // Dust origin anywhere in the stage (stored as an offset from the target).
      scatter.push((Math.random() - 0.5) * WORLD.w - x, (Math.random() - 0.5) * WORLD.h - y, 0);
      rnd.push(Math.random());
      tone.push(s.tone);
      fade.push(s.fadeEnds ? Math.sin(Math.PI * u) ** 0.6 : 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aScatter", new THREE.Float32BufferAttribute(scatter, 3));
  g.setAttribute("aRand", new THREE.Float32BufferAttribute(rnd, 1));
  g.setAttribute("aTone", new THREE.Float32BufferAttribute(tone, 1));
  g.setAttribute("aFade", new THREE.Float32BufferAttribute(fade, 1));
  return g;
}

function morphMaterial(colorA: string, colorB: string, size: number, alpha: number) {
  return new THREE.ShaderMaterial({
    vertexShader: morphVertex,
    fragmentShader: morphFragment,
    uniforms: {
      uForm: { value: 0 },
      uDissolve: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: size },
      uPR: { value: 1 },
      uAlpha: { value: alpha },
      uColorA: { value: col(colorA) },
      uColorB: { value: col(colorB) },
      uWalk: { value: 0 },
      uWalking: { value: 0 },
      uHipY: { value: 0.8 * PERSON_SCALE },
      uLegX: { value: 0.2 * PERSON_SCALE },
    },
    ...additive,
  });
}

// Clip uniforms for the shared hologram shaders: an all-covering rect = no clipping.
const noClip = () => ({ uRect: { value: new THREE.Vector4(-1e5, -1e5, 2e5, 2e5) }, uRadius: { value: 0 } });

export type StoryFrame = { gl: THREE.WebGLRenderer; time: number; s: number };

/**
 * The "How it works" lobby: outlines assemble from dust, a warm-dotted guest walks the
 * journey, a call streams to the hub and the agent forms in the Holobox — all driven by s (0..6).
 */
export class StoryScene {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-WORLD.w / 2, WORLD.w / 2, WORLD.h / 2, -WORLD.h / 2, 0.1, 50);
  private lobbyMat = morphMaterial("#C5CAD1", "#8CC4FF", 2.2, 0.75);
  // Guest: warm paper dots, suitcase in amber.
  private guestMat = morphMaterial("#F4F6F8", "#F8C98B", 2.0, 0.6);
  private flowMat: THREE.ShaderMaterial;
  private glowMat: THREE.ShaderMaterial;
  private agentMat: THREE.ShaderMaterial;
  private coneMat: THREE.ShaderMaterial;
  private ringsMat: THREE.ShaderMaterial;
  private guest: THREE.Points | null = null;
  private agentGroup = new THREE.Group();
  private disposed = false;

  constructor(onLoaded: () => void) {
    this.camera.position.set(0, 0, 10);

    const lobby = new THREE.Points(makeLobby(46), this.lobbyMat);
    lobby.frustumCulled = false;
    this.scene.add(lobby);

    // Holobox interior glow.
    const bw = HOLOBOX.x1 - HOLOBOX.x0;
    const bh = HOLOBOX.y1 - FLOOR;
    this.glowMat = new THREE.ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      uniforms: { uLevel: { value: 0 }, uSize: { value: new THREE.Vector2(bw, bh) } },
      ...additive,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), this.glowMat);
    glow.position.set(HOLOBOX.cx, FLOOR + bh / 2, -0.1);
    glow.renderOrder = -1;
    this.scene.add(glow);

    // Call stream to the hub.
    const n = 240;
    const fg = new THREE.BufferGeometry();
    fg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    fg.setAttribute("aT", new THREE.Float32BufferAttribute(Array.from({ length: n }, () => Math.random()), 1));
    fg.setAttribute("aRand", new THREE.Float32BufferAttribute(Array.from({ length: n }, () => Math.random()), 1));
    this.flowMat = new THREE.ShaderMaterial({
      vertexShader: flowVertex,
      fragmentShader: flowFragment,
      uniforms: {
        uTime: { value: 0 },
        uFlow: { value: 0 },
        uPR: { value: 1 },
        uFrom: { value: new THREE.Vector2(...HUB.from) },
        uCtrl: { value: new THREE.Vector2(...HUB.ctrl) },
        uTo: { value: new THREE.Vector2(...HUB.to) },
      },
      ...additive,
    });
    const flow = new THREE.Points(fg, this.flowMat);
    flow.frustumCulled = false;
    this.scene.add(flow);

    // Agent in the Holobox: same shaders as the hero hologram.
    const shared = { uTime: { value: 0 }, uPR: { value: 1 }, ...noClip() };
    this.agentMat = new THREE.ShaderMaterial({
      vertexShader: agentVertex,
      fragmentShader: agentFragment,
      uniforms: {
        ...shared,
        uProgress: { value: 0 },
        uSize: { value: 4.2 },
        uFlicker: { value: 1 },
        uGlitchY: { value: -10 },
        uGlitchAmt: { value: 0 },
        uSweep: { value: -10 },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPointerOn: { value: 0 },
        uMotion: { value: 1 },
        uDissolve: { value: 0 },
      },
      ...additive,
    });
    this.coneMat = new THREE.ShaderMaterial({
      vertexShader: coneVertex,
      fragmentShader: coneFragment,
      uniforms: { ...shared, uIntensity: { value: 0 } },
      side: THREE.DoubleSide,
      ...additive,
    });
    this.ringsMat = new THREE.ShaderMaterial({
      vertexShader: ringsVertex,
      fragmentShader: ringsFragment,
      uniforms: { ...shared, uMotion: { value: 1 }, uIntensity: { value: 0 } },
      ...additive,
    });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 2, 32, 1, true), this.coneMat);
    cone.position.y = 1;
    const rings = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), this.ringsMat);
    rings.rotation.x = -Math.PI / 2;
    this.agentGroup.add(cone, rings);
    this.agentGroup.position.set(HOLOBOX.cx, HOLOBOX.plinth, 0);
    this.agentGroup.scale.setScalar(PERSON_SCALE * 0.95);
    this.agentGroup.rotation.x = 0.12; // slight top-down tilt so the rings read as a disc
    this.scene.add(this.agentGroup);

    Promise.all([
      loadAgentGeometry("/hologram/guest-9k.bin", 9000),
      loadAgentGeometry("/hologram/agent-12k.bin", 12000),
    ]).then(([guestGeo, agentGeo]) => {
      if (this.disposed) {
        guestGeo.dispose();
        agentGeo.dispose();
        return;
      }
      // Guest (traveller + suitcase): scale to scene units, add morph attributes.
      const n = guestGeo.getAttribute("position").count;
      const pos = guestGeo.getAttribute("position") as THREE.BufferAttribute;
      const flags = guestGeo.getAttribute("aFlags") as THREE.BufferAttribute;
      for (let i = 0; i < n; i++) {
        pos.setXYZ(i, pos.getX(i) * PERSON_SCALE, pos.getY(i) * PERSON_SCALE, pos.getZ(i) * PERSON_SCALE);
      }
      const rnd = Array.from({ length: n }, () => Math.random());
      guestGeo.setAttribute("aRand", new THREE.Float32BufferAttribute(rnd, 1));
      guestGeo.setAttribute("aTone", new THREE.Float32BufferAttribute(Array.from({ length: n }, (_, i) => flags.getX(i) % 2), 1));
      guestGeo.setAttribute("aFade", new THREE.Float32BufferAttribute(new Array(n).fill(1), 1));
      guestGeo.setAttribute(
        "aScatter",
        new THREE.Float32BufferAttribute(
          Array.from({ length: n * 3 }, (_, i) => (Math.random() - 0.5) * (i % 3 === 1 ? 2.4 : 1.6)),
          3,
        ),
      );
      this.guest = new THREE.Points(guestGeo, this.guestMat);
      this.guest.frustumCulled = false;
      this.scene.add(this.guest);

      const agent = new THREE.Points(agentGeo, this.agentMat);
      agent.frustumCulled = false;
      agent.renderOrder = 2;
      this.agentGroup.add(agent);
      onLoaded();
    });
  }

  frame({ gl, time, s }: StoryFrame) {
    const t = timeline(s);
    const pr = gl.getPixelRatio();

    for (const m of [this.lobbyMat, this.guestMat]) {
      m.uniforms.uTime.value = time;
      m.uniforms.uPR.value = pr;
    }
    // Lobby assembles from dust at the start, and lets go at the very end.
    this.lobbyMat.uniforms.uForm.value = t.envForm;
    this.lobbyMat.uniforms.uDissolve.value = Math.max(0, (s - 5.85) / 0.15) * 0.6;

    if (this.guest) {
      // Gait driven by distance travelled, so it stays in step when scrolling backwards too.
      const phase = t.guestX * 3.4;
      const bob = t.walking * Math.abs(Math.sin(phase)) * 0.06;
      this.guest.position.set(t.guestX, FLOOR + bob, 0.2);
      this.guestMat.uniforms.uWalk.value = phase;
      this.guestMat.uniforms.uWalking.value += (t.walking - this.guestMat.uniforms.uWalking.value) * 0.2;
      this.guestMat.uniforms.uForm.value = t.guestIn;
      this.guestMat.uniforms.uDissolve.value = t.guestOut;
    }

    this.flowMat.uniforms.uTime.value = time;
    this.flowMat.uniforms.uPR.value = pr;
    this.flowMat.uniforms.uFlow.value = t.flow;

    const call = Math.max(t.flow, t.agent);
    this.glowMat.uniforms.uLevel.value = 0.2 + 0.5 * call;

    const a = this.agentMat.uniforms;
    a.uTime.value = time;
    a.uPR.value = pr;
    a.uProgress.value = t.agent;
    a.uFlicker.value = THREE.MathUtils.smoothstep(t.agent, 0, 0.12); // invisible until the call connects
    a.uSweep.value = t.agent >= 1 ? ((time % 4.5) / 4.5) * 2.1 - 0.1 : -10;
    this.coneMat.uniforms.uIntensity.value = t.agent;
    this.ringsMat.uniforms.uIntensity.value = Math.max(t.flow * 0.6, t.agent);
    this.agentGroup.rotation.y = Math.sin(time * 0.5) * 0.08;

    gl.autoClear = true;
    gl.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
  }
}
