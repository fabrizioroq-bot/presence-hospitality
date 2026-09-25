/* Fails if messages/en.json and messages/nl.json do not have identical key sets. */
import { readFileSync } from "node:fs";

type Json = { [k: string]: string | Json };
const load = (l: string) => JSON.parse(readFileSync(`messages/${l}.json`, "utf8")) as Json;
const keys = (o: Json, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : keys(v, `${p}${k}.`)));

const en = new Set(keys(load("en")));
const nl = new Set(keys(load("nl")));
const missingNl = [...en].filter((k) => !nl.has(k));
const missingEn = [...nl].filter((k) => !en.has(k));
if (missingNl.length || missingEn.length) {
  if (missingNl.length) console.error("Missing in nl.json:\n  " + missingNl.join("\n  "));
  if (missingEn.length) console.error("Missing in en.json:\n  " + missingEn.join("\n  "));
  process.exit(1);
}
console.log(`i18n OK — ${en.size} keys in both locales.`);
