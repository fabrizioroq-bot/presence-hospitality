import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom type-scale utilities (see globals.css), otherwise it treats
// e.g. `text-heading-md` as a colour and drops it when a `text-ink-900` follows.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display-2xl", "display-xl", "display-lg", "heading-md", "heading-sm", "caps", "body-lg", "body", "body-sm", "label"],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
