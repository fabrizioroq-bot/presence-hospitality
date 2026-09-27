// Broken-link check: every <a href> on every page (EN + NL). Internal links must return 200
// without a redirect and #anchors must exist on the target; external links must respond < 400.
const base = process.argv[2] ?? "http://localhost:3100";
const PAGES = ["/en", "/nl", "/en/solution", "/nl/oplossing", "/en/packages", "/nl/pakketten", "/en/onboarding", "/nl/onboarding", "/en/faq", "/nl/faq", "/en/demo", "/nl/demo", "/en/privacy", "/nl/privacy", "/en/cookies", "/nl/cookies"];
const html = new Map();
const get = async (path) => {
  if (!html.has(path)) {
    const r = await fetch(base + path, { redirect: "manual" });
    html.set(path, { status: r.status, body: r.status === 200 ? await r.text() : "", location: r.headers.get("location") });
  }
  return html.get(path);
};
const links = new Map(); // href -> Set(pages)
for (const page of PAGES) {
  const { body } = await get(page);
  for (const m of body.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (!links.has(href)) links.set(href, new Set());
    links.get(href).add(page);
  }
}
const bad = [];
let checked = 0;
for (const [href, pages] of links) {
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    checked++;
    continue;
  }
  const from = [...pages][0];
  if (href.startsWith("#")) {
    const id = href.slice(1);
    for (const p of pages) if (id !== "top" && id !== "main" && !(await get(p)).body.includes(`id="${id}"`)) bad.push(`${href} (anchor missing on ${p})`);
    checked++;
    continue;
  }
  const u = new URL(href, base + from);
  if (u.origin === new URL(base).origin) {
    const r = await get(u.pathname + u.search);
    if (r.status !== 200) bad.push(`${href} → ${r.status}${r.location ? " " + r.location : ""} (on ${[...pages].slice(0, 2).join(", ")})`);
    else if (u.hash && u.hash !== "#top" && !r.body.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`)) bad.push(`${href} (anchor missing)`);
  } else {
    try {
      const r = await fetch(u, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 link-check" } });
      if (r.status >= 400) bad.push(`${href} → ${r.status}`);
    } catch (e) {
      // The production domain may not resolve yet (DNS pending with the IT partner).
      bad.push(`${href} → ${e.cause?.code ?? e.message}`);
    }
  }
  checked++;
}
console.log(`${checked} unique links checked on ${PAGES.length} pages`);
console.log(bad.length ? "Problems:\n  " + bad.join("\n  ") : "no broken links");
