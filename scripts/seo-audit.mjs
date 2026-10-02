// Brand-SEO audit of every sitemap URL: status 200 without redirects, title/description, canonical,
// hreflang (en, nl, x-default), Open Graph, no accidental noindex, one H1, image alts, and the
// JSON-LD types each page must carry, with Google's required rich-result properties.
// Usage: node scripts/seo-audit.mjs [base]   (default https://presence-hospitality.com)
// The sitemap is read from the base; URLs in it are rewritten to the base for local runs.
const base = (process.argv[2] ?? "https://presence-hospitality.com").replace(/\/$/, "");
const DOMAIN = "https://presence-hospitality.com";

const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const titles = new Map();
let problems = 0;

const attr = (html, re) => html.match(re)?.[1];
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

for (const url of urls) {
  const path = url.replace(DOMAIN, "");
  const res = await fetch(base + path, { redirect: "manual" });
  const html = await res.text();
  const issues = [];
  if (res.status !== 200) issues.push(`status ${res.status}`);
  if (res.headers.get("x-robots-tag")?.includes("noindex")) issues.push("X-Robots-Tag noindex");

  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const ogImage = attr(html, /<meta property="og:image" content="([^"]*)"/);
  const hreflang = Object.fromEntries(
    [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
  );
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const noAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length;

  if (!title) issues.push("no <title>");
  else if (!title.includes("Presence Hospitality")) issues.push(`title without brand: ${title}`);
  // Unique per locale (an EN and NL page may share a title such as "Onboarding"; hreflang pairs them).
  const key = `${path.split("/")[1]}|${title}`;
  if (titles.has(key)) issues.push(`duplicate title with ${titles.get(key)}`);
  titles.set(key, path);
  if (!desc) issues.push("no description");
  else if (desc.length < 70 || desc.length > 165) issues.push(`description length ${desc.length}`);
  if (canonical !== url) issues.push(`canonical ${canonical}`);
  if (ogUrl !== url) issues.push(`og:url ${ogUrl}`);
  if (!ogImage?.startsWith(DOMAIN)) issues.push(`og:image ${ogImage}`);
  for (const l of ["en", "nl", "x-default"]) if (!hreflang[l]?.startsWith(DOMAIN)) issues.push(`hreflang ${l} ${hreflang[l]}`);
  if (!Object.values(hreflang).includes(url)) issues.push("page missing from its own hreflang set");
  if (robots?.includes("noindex")) issues.push(`meta robots ${robots}`);
  if (h1 !== 1) issues.push(`h1×${h1}`);
  if (noAlt) issues.push(`${noAlt} <img> without alt`);
  if (/vercel\.app/.test(html)) issues.push("mentions vercel.app");

  // Structured data
  const blocks = all(html, /<script type="application\/ld\+json">(.*?)<\/script>/gs).map((s) => JSON.parse(s));
  const nodes = blocks.flatMap((b) => b["@graph"] ?? [b]);
  const byType = (t) => nodes.filter((n) => n["@type"] === t);
  const need = ["Organization", "ProfessionalService", "WebSite"];
  const isHome = /^\/(en|nl)$/.test(path);
  if (!isHome) need.push("BreadcrumbList");
  if (path.endsWith("/faq")) need.push("FAQPage");
  for (const t of need) if (!byType(t).length) issues.push(`JSON-LD ${t} missing`);

  const [org] = byType("Organization");
  if (org) {
    for (const k of ["name", "url", "logo"]) if (!org[k]) issues.push(`Organization.${k} missing`);
    if (org.name !== "Presence Hospitality") issues.push(`Organization.name ${org.name}`);
  }
  const [lb] = byType("ProfessionalService");
  if (lb && !(lb.name && lb.address?.streetAddress && lb.address?.addressLocality)) issues.push("LocalBusiness name/address incomplete");
  const [ws] = byType("WebSite");
  if (ws && (ws.name !== "Presence Hospitality" || !ws.url)) issues.push("WebSite name/url");
  for (const bl of byType("BreadcrumbList")) {
    const items = bl.itemListElement ?? [];
    if (items.length < 2) issues.push("BreadcrumbList < 2 items");
    items.forEach((it, i) => {
      if (it.position !== i + 1 || !it.name || !it.item?.startsWith(DOMAIN)) issues.push(`Breadcrumb item ${i + 1} invalid`);
    });
    if (items.at(-1)?.item !== url) issues.push("last breadcrumb is not the page");
  }
  for (const fq of byType("FAQPage")) {
    const qs = fq.mainEntity ?? [];
    if (!qs.length) issues.push("FAQPage without questions");
    for (const q of qs) if (q["@type"] !== "Question" || !q.name || q.acceptedAnswer?.["@type"] !== "Answer" || !q.acceptedAnswer.text) issues.push(`FAQ question invalid: ${q.name}`);
  }

  problems += issues.length;
  console.log(`${issues.length ? "✗" : "✓"} ${path.padEnd(18)} ${title}`);
  for (const i of issues) console.log(`    - ${i}`);
}

console.log(`\n${urls.length} URLs, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
