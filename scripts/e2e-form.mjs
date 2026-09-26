// Fills and submits the demo form. Usage: node scripts/e2e-form.mjs <baseUrl> <path> <hotelName>
import { chromium } from "playwright";
const [base = "http://localhost:3000", path = "/en", hotel = `E2E Test Hotel ${Date.now()}`] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 200)));
await p.goto(base + path, { waitUntil: "networkidle" });
await p.locator("#demo").scrollIntoViewIfNeeded();
await p.waitForTimeout(600);

// 1) Empty submit → client errors + summary, focus on first invalid field
await p.click('#demo button[type="submit"]');
await p.waitForTimeout(300);
const errs = await p.$$eval('#demo [aria-invalid="true"]', (els) => els.map((e) => e.getAttribute("name")));
const focused = await p.evaluate(() => document.activeElement?.getAttribute("name"));
const summary = await p.locator('#demo [role="alert"]').count();
console.log(`empty submit → invalid: ${errs.join(",")} | focus: ${focused} | summary: ${summary}`);

// 2) Valid submit
await p.fill("#demo-first_name", "E2E");
await p.fill("#demo-last_name", "Tester");
await p.fill("#demo-email", "e2e.tester@example.com");
await p.fill("#demo-phone", "+31 6 1234 5678");
await p.selectOption("#demo-position", "general_manager");
await p.fill("#demo-hotel_name", hotel);
await p.fill("#demo-pms", "Mews");
await p.fill("#demo-description", "Automated end-to-end test lead. Please ignore — it is deleted right after the test.");
await p.check("#demo-consent");
await p.waitForTimeout(3200); // human-plausible fill time (bot time-trap is 3 s)
await p.click('#demo button[type="submit"]');
await p.waitForSelector("#demo .success-title", { timeout: 15000 });
console.log("valid submit → success:", (await p.locator("#demo .success-title").innerText()).trim(), "| focus on title:", await p.evaluate(() => document.activeElement?.classList.contains("success-title")));
await p.locator("#demo").screenshot({ path: "screenshots/phase-10/demo-success.png" });
console.log("HOTEL=" + hotel);
await b.close();
