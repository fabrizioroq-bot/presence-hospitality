import { chromium } from "playwright";
const [path, width] = [process.argv[2], Number(process.argv[3])];
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width, height: 900 } });
await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
await p.locator("#faq").scrollIntoViewIfNeeded();
await p.waitForTimeout(800);
await p.locator('#faq button[aria-expanded]').nth(2).click();
await p.waitForTimeout(600);
const exp = await p.$$eval('#faq button[aria-expanded]', (bs) => bs.map((b) => b.getAttribute("aria-expanded")));
console.log("expanded:", exp.join(","));
// keyboard: tab to next button and press Enter
await p.keyboard.press("Tab");
await p.keyboard.press("Enter");
await p.waitForTimeout(500);
console.log("after keyboard:", (await p.$$eval('#faq button[aria-expanded]', (bs) => bs.map((b) => b.getAttribute("aria-expanded")))).join(","));
await p.locator("#faq").screenshot({ path: `screenshots/phase-9/faq${path.replace("/", "-")}-${width}.png` });
await b.close();
