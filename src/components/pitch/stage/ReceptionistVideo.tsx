"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { SRGBColorSpace, VideoTexture, type Mesh, type MeshBasicMaterial } from "three";
import { getPitch } from "../pitch-store";
import { approach, sceneFor } from "./scene-state";

// Must match the Holobox screen (Holobox.tsx): 0.76 × 1.72 m, centred 1.06 m up, on the front face.
const SCREEN = { w: 0.76, h: 1.72, y: 1.06, z: 0.256 };
const FADE_RATE = 2.2;

/**
 * A real receptionist on a live call: a muted, looping clip on the Holobox screen (portrait 9:16,
 * cropped to cover). Plays only while the story shows the receptionist.
 */
export function ReceptionistVideo({ clip, motion }: { clip: { src: string; poster: string }; motion: number }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const media = useRef<{ video: HTMLVideoElement; texture: VideoTexture } | null>(null);
  const visible = useRef(0);

  useEffect(() => {
    const video = document.createElement("video");
    Object.assign(video, { src: clip.src, poster: clip.poster, muted: true, loop: true, playsInline: true, preload: "auto" });
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    media.current = { video, texture };
    if (material.current) {
      material.current.map = texture;
      material.current.needsUpdate = true;
    }
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      media.current = null;
    };
  }, [clip]);

  useFrame((_, dt) => {
    const m = mesh.current;
    const mat = material.current;
    const md = media.current;
    if (!m || !mat || !md) return;
    const { chapter, step } = getPitch();
    const on = sceneFor(chapter, step).agent > 0;
    visible.current = motion === 0 ? Number(on) : approach(visible.current, Number(on), FADE_RATE, dt);
    mat.opacity = visible.current;
    m.visible = visible.current > 0.01;
    if (on && md.video.paused) md.video.play().catch(() => {}); // muted autoplay is allowed
    else if (!on && !md.video.paused && visible.current < 0.01) md.video.pause();
    // Cover-crop the clip into the screen's aspect ratio.
    const { videoWidth: vw, videoHeight: vh } = md.video;
    const aspect = vw && vh ? vw / vh : 9 / 16;
    const screenAspect = SCREEN.w / SCREEN.h;
    const sx = Math.min(1, screenAspect / aspect);
    const sy = Math.min(1, aspect / screenAspect);
    md.texture.repeat.set(sx, sy);
    md.texture.offset.set((1 - sx) / 2, (1 - sy) / 2);
  });

  return (
    <mesh ref={mesh} position={[0, SCREEN.y, SCREEN.z]} visible={false}>
      <planeGeometry args={[SCREEN.w, SCREEN.h]} />
      <meshBasicMaterial ref={material} transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}
