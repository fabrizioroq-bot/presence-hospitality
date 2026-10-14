"use client";

import { holoboxLoop } from "@/content/media";
import { Agent } from "./Agent";
import { ReceptionistVideo } from "./ReceptionistVideo";

/**
 * Who appears in the Holobox. Today: the faceless point-cloud figure. Once real call footage exists
 * (`holoboxLoop` in src/content/media.ts), a muted looping clip plays on the Holobox screen instead —
 * same story beats (sceneFor().agent), no scene changes.
 */
export function Receptionist({ motion }: { motion: number }) {
  return holoboxLoop ? <ReceptionistVideo clip={holoboxLoop} motion={motion} /> : <Agent motion={motion} />;
}
