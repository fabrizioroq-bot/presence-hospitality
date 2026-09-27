// Mobile: every card in each swipe row has the same height.
import { webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await webkit.launch();
const p = await (await b.newContext({ ...devices["iPhone 15"] })).newPage();
for (const path of ["/en", "/nl", "/en/solution", "/nl/oplossing", "/en/onboarding", "/nl/onboarding"]) {
  await p.goto(base + path, { waitUntil: "networkidle" });
  const rows = await p.$$eval(".swipe-row", (rs) => rs.map((r) => {
    const hs = [...r.children].filter((c) => c.classList.contains("swipe-item")).map((c) => {
      // the visible card: the item itself, or its single card child
      const card = c.querySelector(":scope > * > .rounded-xl, :scope > .rounded-xl, :scope > .rounded-lg") ?? c;
      return Math.round(card.getBoundingClientRect().height);
    });
    return `${r.id || "row"}: ${hs.join("/")}${new Set(hs).size === 1 ? " ✓" : " ✗"}`;
  }));
  console.log(path.padEnd(16), rows.join(" · "));
}
await b.close();
