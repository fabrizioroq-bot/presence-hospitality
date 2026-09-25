import { splitHeadline } from "@/lib/headline";
import { cn } from "@/lib/cn";
import { AnimatedWords } from "./AnimatedWords";

type Tag = "h1" | "h2" | "h3" | "p";

/** Static headline with one italic emphasis phrase. `raw` uses `<em>…</em>`. */
export function Headline({
  raw,
  as: Tag = "h2",
  className,
  id,
  animated = true,
}: {
  raw: string;
  as?: Tag;
  className?: string;
  id?: string;
  animated?: boolean;
}) {
  const words = splitHeadline(raw);
  if (animated) return <AnimatedWords words={words} as={Tag} className={className} id={id} />;
  return (
    <Tag id={id} className={cn(className)}>
      {words.map((w, i) => (
        <span key={i} className={w.glued ? "inline-block hyphens-manual" : "inline-block whitespace-nowrap"}>
          {w.parts.map((p, j) =>
            p.em ? (
              <em key={j} className="emph">
                {p.text}
              </em>
            ) : (
              <span key={j}>{p.text}</span>
            ),
          )}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
