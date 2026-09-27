/**
 * Class joiner for client components (no tailwind-merge: keeps ~8 KB gz out of the browser bundle).
 * Only use it where the joined classes never conflict; server components use `cn` (with merging).
 */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
