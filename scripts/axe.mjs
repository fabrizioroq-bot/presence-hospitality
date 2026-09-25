// Runs axe-core (WCAG 2.2 AA) on the given paths; prints serious/critical violations.
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const paths = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
let bad = 0;
for (const path of paths) {
  for (const width of [390, 1440]) {
    const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(base + path, { waitUntil: "networkidle" });
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const v = r.violations.filter((x) => ["serious", "critical"].includes(x.impact));
    bad += v.length;
    console.log(`${path} @${width}: ${v.length} serious/critical, ${r.violations.length - v.length} minor`);
    for (const x of r.violations) console.log(`  [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length}) → ${x.nodes[0]?.target}`);
    await ctx.close();
  }
}
await b.close();
process.exit(bad ? 1 : 0);
