import type { CSSProperties } from "react";
import type { HeadlineWord } from "@/lib/headline";

type Tag = "h1" | "h2" | "h3" | "p";
type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Word-by-word rise + unblur (adapted from React Bits "Blur Text"), CSS-driven (see Reveal.tsx).
 * Opacity stays at 1 so the text is painted immediately — safe for LCP.
 * `trigger="load"` animates on mount (hero); default animates on first view.
 */
export function AnimatedWords({
  words,
  as: Comp = "h2",
  className,
  id,
  trigger = "view",
  delay = 0,
  step = 0.07,
}: {
  words: HeadlineWord[];
  as?: Tag;
  className?: string;
  id?: string;
  trigger?: "load" | "view";
  delay?: number;
  step?: number;
}) {
  const style: Vars = { "--rv-step": `${step}s`, "--rv-delay": `${delay}s` };
  return (
    <Comp id={id} className={className} style={style} data-rv-trigger="" suppressHydrationWarning data-rv-amount="0.5" data-rv-load={trigger === "load" ? "" : undefined}>
      {words.map((w, i) => (
        <span key={i}>
          <span
            suppressHydrationWarning data-rv="word"
            style={{ "--rv-i": i } as Vars}
            className={w.glued ? "inline-block hyphens-manual" : "inline-block whitespace-nowrap"}
          >
            {w.parts.map((p, j) =>
              p.em ? (
                <em key={j} className="emph">
                  {p.text}
                </em>
              ) : (
                <span key={j}>{p.text}</span>
              ),
            )}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Comp>
  );
}
