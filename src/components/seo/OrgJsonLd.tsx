import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";

/** Organization structured data: domain, email, sales + support phones, address, parent company. */
export async function OrgJsonLd() {
  const t = await getTranslations("meta");
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.domainUrl,
    description: t("description"),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    },
    contactPoint: site.phones.map((p) => ({
      "@type": "ContactPoint",
      contactType: p.key === "sales" ? "sales" : "customer support",
      telephone: p.href.replace("tel:", ""),
      email: site.email,
      availableLanguage: ["en", "nl"],
    })),
    parentOrganization: { "@type": "Organization", name: site.parent },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
