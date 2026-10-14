import { PMREMGenerator, type Scene, type WebGLRenderer } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const INTENSITY = 0.45;

/**
 * A soft studio reflection map (generated, no file), so clear-coated surfaces catch real highlights.
 * Called once from the Canvas's onCreated; the texture lives as long as the WebGL context.
 */
export function applyEnvironment(gl: WebGLRenderer, scene: Scene) {
  const pmrem = new PMREMGenerator(gl);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = INTENSITY;
  room.dispose();
  pmrem.dispose();
}
