import type { ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

/** The four contexts every kit token and component must work in. */
export const CONTEXTS = [
  { id: "site-light", label: "Site · light", attrs: { "data-mood": "mist" } },
  { id: "site-dark", label: "Site · dark", attrs: { "data-mood": "night" } },
  { id: "pitch-light", label: "Pitch · light", attrs: { "data-theme": "pitch" } },
  { id: "pitch-dark", label: "Pitch · dark", attrs: { "data-theme": "pitch-dark" } },
] as const;

export type Context = (typeof CONTEXTS)[number];

/** One themed panel. */
export function ContextPanel({ ctx, className, children }: { ctx: Context; className?: string; children: ReactNode }) {
  return (
    <div {...ctx.attrs} className={cn("rounded-lg bg-ui-bg p-6 text-ui-ink sm:p-8", className)}>
      <p className="text-label text-ui-muted">{ctx.label}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/** The same content rendered in each context (all four by default). */
export function ContextGrid({
  only,
  columns = 2,
  children,
}: {
  only?: Context["id"][];
  columns?: 1 | 2;
  children: (ctx: Context) => ReactNode;
}) {
  const list = only ? CONTEXTS.filter((c) => only.includes(c.id)) : CONTEXTS;
  return (
    <div className={cn("grid gap-4", columns === 2 && "lg:grid-cols-2")}>
      {list.map((ctx) => (
        <ContextPanel key={ctx.id} ctx={ctx}>
          {children(ctx)}
        </ContextPanel>
      ))}
    </div>
  );
}

/** Section wrapper with an anchor and a short description. */
export function KitSection({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="text-display-lg">
        {title}
      </h2>
      <div className="mt-3 max-w-[68ch] text-body text-paper-300">{intro}</div>
      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </section>
  );
}

/** Small heading inside a section. */
export function KitSub({ children }: { children: ReactNode }) {
  return <h3 className="text-heading-sm text-paper-50">{children}</h3>;
}
