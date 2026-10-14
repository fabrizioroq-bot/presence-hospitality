import { splitHeadline } from "@/lib/headline";
import { cx } from "@/lib/cx";

/**
 * A pitch headline that assembles word by word when its chapter opens (pitch.css: masked words rise
 * with a stagger; the italic emphasis settles last). The text stays real, readable HTML.
 */
export function SlideHeadline({
  raw,
  as: Tag = "h2",
  build = 0,
  className,
}: {
  /** Headline with one optional `<em>` phrase, from messages. */
  raw: string;
  as?: "h1" | "h2";
  /** Build step that reveals it. */
  build?: number;
  className?: string;
}) {
  const words = splitHeadline(raw);
  return (
    <Tag className={cx("pitch-headline", className)} data-words={build}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="pitch-word" style={{ "--i": i } as React.CSSProperties}>
            <span>
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
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
