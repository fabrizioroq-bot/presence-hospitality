import { getTranslations } from "next-intl/server";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import type { LegalDoc } from "@/content/legal";
import { site } from "@/content/site";

/** Long-form legal page content on mist (wrap in <PageShell>). */
export async function LegalPage({
  doc,
  locale,
}: {
  doc: LegalDoc;
  locale: "en" | "nl";
}) {
  const f = await getTranslations("footer");
  const c = await getTranslations("common");
  return (
    <div
      data-mood="mist"
      className="relative isolate overflow-x-clip bg-mist-bg pt-[calc(var(--nav-h)+64px)] pb-24 text-ink-900"
    >
      <ParallaxOrbs
        orbs={[
          {
            color: "sky",
            size: "min(50vw, 700px)",
            top: "-10%",
            right: "-16%",
            opacity: 0.5,
            dur: 24,
          },
        ]}
      />
      <article className="container-site max-w-3xl">
        <a
          href={`/${locale}`}
          className="text-body-sm text-ink-700 underline-offset-4 hover:underline"
        >
          ← Presence Hospitality
        </a>
        <h1 className="mt-8 text-display-xl">{doc.title}</h1>
        <p className="mt-4 text-label text-ink-500">{doc.updated}</p>
        <p className="mt-8 text-body-lg text-ink-700">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-12">
            <h2 className="text-heading-md">{s.h}</h2>
            {s.p?.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 text-body text-ink-700">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-4 flex flex-col gap-2 text-body text-ink-700">
                {s.list.map((li) => (
                  <li key={li.slice(0, 24)} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900"
                    />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <p className="mt-12 border-t border-line-mist/50 pt-8 text-body text-ink-700">
          {f("contact")}:{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-link-mist underline underline-offset-4"
          >
            {site.email}
          </a>{" "}
          {site.phones.map((ph) => (
            <span key={ph.key}>
              {" "}
              · {c(ph.key === "sales" ? "phoneSales" : "phoneSupport")}{" "}
              <a href={ph.href} className="text-link-mist underline underline-offset-4">
                {ph.display}
              </a>
            </span>
          ))}
        </p>
      </article>
    </div>
  );
}
