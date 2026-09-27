import type { CSSProperties } from "react";
import { splitHeadline } from "@/lib/headline";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Reveals each line with a clip-path wipe from the top, staggered 90 ms (CSS-driven, see Reveal.tsx). Lines may contain one `<em>`. */
export function LineReveal({ lines, className, lineClassName }: { lines: string[]; className?: string; lineClassName?: string }) {
  return (
    <p className={className} style={{ "--rv-step": "0.09s" } as Vars} data-rv-trigger="" data-rv-amount="0.4">
      {lines.map((line, i) => (
        <span key={i} className={lineClassName ?? "block"} data-rv="line" style={{ "--rv-i": i } as Vars}>
          {splitHeadline(line).map((w, j, arr) => (
            <span key={j} className={w.glued ? "hyphens-manual" : undefined}>
              {w.parts.map((p, k) =>
                p.em ? (
                  <em key={k} className="emph">
                    {p.text}
                  </em>
                ) : (
                  <span key={k}>{p.text}</span>
                ),
              )}
              {j < arr.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
