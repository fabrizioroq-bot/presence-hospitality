import { getTranslations } from "next-intl/server";
import { faq } from "@/content/faq";

/** FAQPage structured data from the same enabled rows the page shows. */
export async function FaqJsonLd() {
  const t = await getTranslations("faq");
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq
      .filter((f) => f.enabled)
      .map((f) => ({
        "@type": "Question",
        name: t(`items.${f.id}.q` as "items.pms.q"),
        acceptedAnswer: { "@type": "Answer", text: t(`items.${f.id}.a` as "items.pms.a") },
      })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
