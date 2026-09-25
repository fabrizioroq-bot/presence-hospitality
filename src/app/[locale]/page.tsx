import { setRequestLocale } from "next-intl/server";

// Phase 1 placeholder — sections are added from Phase 2 onwards.
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" className="container-site section-pad">
      <p className="text-label text-ink-500">Presence Hospitality — foundations</p>
    </main>
  );
}
