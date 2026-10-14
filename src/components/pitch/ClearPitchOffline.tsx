"use client";

import { useEffect } from "react";

/**
 * Rendered on the login page: whoever lands there (signed out or session expired) loses the pitch's
 * offline copy, so nothing stays on a shared laptop.
 */
export function ClearPitchOffline() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) =>
        Promise.all(
          regs
            .filter((r) => r.scope.endsWith("/dashboard/pitch"))
            .map(async (r) => {
              r.active?.postMessage({ type: "clear" });
              await r.unregister();
            }),
        ),
      )
      .then(() => caches.delete("pitch-v1"))
      .catch((err: unknown) => console.warn("Could not clear the pitch offline cache:", err));
  }, []);
  return null;
}
