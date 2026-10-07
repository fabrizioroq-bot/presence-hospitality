import { getLocale, getTranslations } from "next-intl/server";
import { site } from "@/content/site";

/**
 * Structured data for brand search (every public page via PageShell, EN + NL): one @graph with
 * - Organization: name, legal name, logo, contact email, official profiles;
 * - ProfessionalService (a schema.org LocalBusiness type): the Amsterdam office;
 * - WebSite: the site name Google shows above the result.
 * Everything comes from src/content/site.ts; `sameAs` renders only when profiles are listed.
 */
export async function OrgJsonLd() {
  const t = await getTranslations("meta");
  const locale = await getLocale();
  const base = site.domainUrl;
  const org = `${base}/#organization`;
  const logo = {
    "@type": "ImageObject",
    "@id": `${base}/#logo`,
    url: `${base}${site.logo}`,
    contentUrl: `${base}${site.logo}`,
    width: 512,
    height: 512,
    caption: site.name,
  };
  const address = {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressCountry: site.address.country,
  };
  const sameAs = site.sameAs.length ? { sameAs: site.sameAs } : {};

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: site.name,
        legalName: site.legalName,
        url: base,
        logo,
        image: { "@id": `${base}/#logo` },
        description: t("description"),
        email: site.email,
        address,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: site.email,
          availableLanguage: ["English", "Dutch"],
        },
        ...sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${base}/#localbusiness`,
        name: site.name,
        url: base,
        logo: { "@id": `${base}/#logo` },
        image: `${base}${site.logo}`,
        description: t("description"),
        email: site.email,
        address,
        areaServed: { "@type": "Country", name: "Netherlands" },
        ...sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: site.name,
        alternateName: [site.legalName, "presence-hospitality.com"],
        url: `${base}/`,
        inLanguage: locale === "nl" ? "nl-NL" : "en-GB",
        publisher: { "@id": org },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
