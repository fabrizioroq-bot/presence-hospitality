import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { IntakeStatus } from "@/components/intake/IntakeStatus";
import { IntakeSummary } from "@/components/intake/IntakeSummary";
import { INTAKE_FORM, INTAKE_LANGS, type IntakeLang } from "@/content/onboarding-form";
import { INTAKE_STRING_KEYS, fill, formatIntakeDate, type IntakeStrings } from "@/lib/intake/format";
import { loadIntake } from "@/lib/intake/invites";

const pickLang = (v: unknown, fallback: IntakeLang): IntakeLang =>
  INTAKE_LANGS.includes(v as IntakeLang) ? (v as IntakeLang) : fallback;

export async function generateMetadata({ searchParams }: PageProps<"/intake/[token]">): Promise<Metadata> {
  const lang = pickLang((await searchParams).lang, "en");
  const t = await getTranslations({ locale: lang, namespace: "intake" });
  return { title: t("metaTitle") };
}

const SECTIONS = INTAKE_FORM.en.sections.length;

export default async function IntakePage({ params, searchParams }: PageProps<"/intake/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const intake = await loadIntake(token);
  const lang = pickLang(sp.lang, intake?.language ?? "en");
  const t = await getTranslations({ locale: lang, namespace: "intake" });

  if (!intake || intake.state === "not_found") return <IntakeStatus lang={lang} title={t("invalidTitle")} body={t.raw("invalidBody") as string} />;
  if (intake.state === "expired") return <IntakeStatus lang={lang} title={t("expiredTitle")} body={t.raw("expiredBody") as string} />;
  if (intake.state === "revoked") return <IntakeStatus lang={lang} title={t("revokedTitle")} body={t.raw("revokedBody") as string} />;

  const doc = INTAKE_FORM[lang];
  if (intake.state === "submitted") {
    const sentOn = intake.submittedAt ? formatIntakeDate(intake.submittedAt.slice(0, 10), lang) : "";
    return (
      <main lang={lang} className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8 lg:py-14">
        <Logo on="light" className="h-6" />
        <div className="flex max-w-[68ch] flex-col gap-4">
          <h1 className="text-display-lg text-(--ph-brand-primary)">{t("thanksTitle")}</h1>
          <p className="text-body-lg text-(--ph-text-secondary)">{doc.closing}</p>
          {sentOn && !intake.isPastExpiry && <p className="text-body-sm text-(--ph-text-muted)">{fill(t.raw("sentOn") as string, { date: sentOn })}</p>}
        </div>
        {/* The answers stay visible through the link only until it expires; after that, thanks only. */}
        {!intake.isPastExpiry && <IntakeSummary doc={doc} answers={intake.answers} lang={lang} notAnswered={t("notAnswered")} />}
      </main>
    );
  }

  const strings = Object.fromEntries(INTAKE_STRING_KEYS.map((k) => [k, t.raw(k) as string])) as IntakeStrings;
  const step = Math.min(Math.max(Number.parseInt(String(sp.step ?? "0"), 10) || 0, 0), SECTIONS + 1);
  const base = `/intake/${token}`;
  return (
    <IntakeForm
      logo={<Logo on="light" className="h-5 sm:h-6" />}
      // Remount when the language changes so every label switches at once.
      key={lang}
      token={token}
      lang={lang}
      doc={doc}
      initialAnswers={intake.answers}
      serverUpdatedAt={intake.updatedAt}
      initialStep={step}
      langHrefs={{ en: `${base}?lang=en`, nl: `${base}?lang=nl` }}
      privacyHref={`/${lang}/privacy`}
      strings={strings}
    />
  );
}
