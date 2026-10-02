// Pings IndexNow (Bing, Yandex, Seznam, Naver…) with every sitemap URL so they recrawl after a deploy.
// Runs after `next build` (package.json "build") and only does something on Vercel production
// builds; `npm run indexnow -- --force` pings by hand. Never fails the build.
import sitemap from "../src/app/sitemap";
import { site } from "../src/content/site";

const force = process.argv.includes("--force");
if (process.env.VERCEL_ENV !== "production" && !force) {
  console.log("IndexNow: skipped (not a production build)");
  process.exit(0);
}

const { host } = new URL(site.domainUrl);
const body = {
  host,
  key: site.indexNowKey,
  keyLocation: `${site.domainUrl}/${site.indexNowKey}.txt`,
  urlList: sitemap().map((e) => e.url),
};

async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  // 200 OK / 202 Accepted (key validation pending) are both fine.
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${body.urlList.length} URLs`);
}

main().catch((err) => console.warn("IndexNow: ping failed (ignored)", err));
