import { getTranslations } from "next-intl/server";

/** Home 02: quiet proof right under the hero — who is behind this, and is it real? */
export async function TrustBar() {
  const t = await getTranslations("trust");
  const items = t.raw("items") as string[];
  return (
    <section aria-label={t("label")} data-mood="mist" className="relative bg-mist-bg pb-4 text-ink-900 lg:pb-8">
      <div className="container-site">
        <ul className="grid gap-x-8 gap-y-3 border-y border-line-mist/40 py-6 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-between lg:py-7">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3 text-body font-semibold text-petrol">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-teal" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
