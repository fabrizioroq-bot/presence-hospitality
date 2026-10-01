/** Warm palette preview (`?palette=a|b`, set on <html> by the boot script); undefined = default look. */
export const warmPalette = (): "a" | "b" | undefined => {
  const p = document.documentElement.dataset.palette;
  return p === "a" || p === "b" ? p : undefined;
};
