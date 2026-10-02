/** The vertical "HOTEL" neon from the pitch photo, drawn in code. Flickers once when it comes into view (CSS, see globals.css). */
export function NeonSign({ word = "HOTEL" }: { word?: string }) {
  return (
    <div aria-hidden className="flex flex-col items-center gap-2" data-rv-trigger="" suppressHydrationWarning data-rv-amount="0.6" data-rv="neon">
      {word.split("").map((c, i) => (
        <span
          key={i}
          className="grid h-14 w-12 place-items-center rounded-sm border border-neon/70 text-[1.75rem] font-extrabold text-neon"
          style={{ textShadow: "0 0 8px rgba(224,122,95,0.9), 0 0 24px rgba(224,122,95,0.5)", boxShadow: "0 0 14px rgba(224,122,95,0.35), inset 0 0 10px rgba(224,122,95,0.25)" }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}
