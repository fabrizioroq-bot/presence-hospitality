/*
 * Fails if any text in the intake form (src/content/onboarding-form.ts) differs from the source .docx
 * (docs/onboarding/Presence_Onboarding_2.0_{ENG,NL}.docx), in content or order, per language.
 * docs/ is local only (never pushed): where the .docx are missing this prints SKIP instead of failing.
 */
import { existsSync, readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import {
  CHOICE_LABELS,
  CHOICE_VALUES,
  INTAKE_FIELDS,
  INTAKE_FORM,
  YES_NO_ADDED_IN_EN,
  type IntakeLang,
  type FieldKey,
} from "../src/content/onboarding-form";

const DOCX: Record<IntakeLang, string> = {
  en: "docs/onboarding/Presence_Onboarding_2.0_ENG.docx",
  nl: "docs/onboarding/Presence_Onboarding_2.0_NL.docx",
};
/** Internal lines of the .docx that are not part of the form. */
const SKIP_LINES = new Set(["TEXT-ONLY CONTENT FOR GRAPHIC DESIGN", "TEKSTINHOUD VOOR GRAFISCHE VORMGEVING"]);
/** The EN .docx prints both part labels together above section 01; the form shows PART 2 above 03. */
const RELOCATED = new Set(["PART 2 • PROPERTY FACTS & READINESS"]);

// ---- Minimal .docx reader: zip central directory → word/document.xml → paragraph text ----------
function readZipEntry(file: string, name: string): string {
  const buf = readFileSync(file);
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error(`${file}: not a zip file`);
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const entry = buf.toString("utf8", p + 46, p + 46 + nameLen);
    if (entry === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const data = buf.subarray(start, start + size);
      return (method === 0 ? data : inflateRawSync(data)).toString("utf8");
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${file}: ${name} not found`);
}

const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos);/g, (_, e: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[e]!);

/** Paragraph texts in document order, normalised the way the form shows them. */
function docxLines(file: string): string[] {
  const xml = readZipEntry(file, "word/document.xml");
  const paragraphs = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [];
  return paragraphs
    .map((p) =>
      decode(
        (p.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>|<w:tab\/>/g) ?? [])
          .map((t) => (t === "<w:tab/>" ? "\t" : t.replace(/<[^>]+>/g, "")))
          .join(""),
      ),
    )
    .map((t) => t.replace(/^☐ /, "").replace(/\s*_{3,}\s*$/, "").trim())
    .filter((t) => t && !/^_+$/.test(t) && !SKIP_LINES.has(t));
}

// ---- Expected sequence from the form schema ----------------------------------------------------
function formLines(lang: IntakeLang, errors: string[]): string[] {
  const doc = INTAKE_FORM[lang];
  const out = [doc.title, ...doc.intro, ...doc.ident.map((i) => i.label)];
  for (const s of doc.sections) {
    if (s.part) out.push(s.part);
    out.push(s.title);
    if (s.desc) out.push(s.desc);
    for (const g of s.groups) {
      if (g.title) out.push(g.title);
      for (const item of g.items) {
        const kind = INTAKE_FIELDS[item.key].kind;
        if (kind !== "yesNo" && kind !== "yesNoUnknown") {
          if (item.raw) errors.push(`${lang} ${item.key}: "raw" on a ${kind} field`);
          out.push(item.label);
          continue;
        }
        if (!item.raw) {
          if (!(lang === "en" && YES_NO_ADDED_IN_EN.includes(item.key))) {
            errors.push(`${lang} ${item.key}: Yes/No field without its options line in the .docx`);
          }
          out.push(item.label);
          continue;
        }
        const options = CHOICE_VALUES[kind].map((v) => CHOICE_LABELS[lang][v]).join(" / ");
        if (item.raw !== `${item.label} ${options}`) {
          errors.push(`${lang} ${item.key}: label + options "${item.label} ${options}" ≠ "${item.raw}"`);
        }
        out.push(item.raw);
      }
    }
  }
  out.push(doc.closing);
  return out;
}

function checkKeys(lang: IntakeLang, errors: string[]) {
  const doc = INTAKE_FORM[lang];
  const seen = [...doc.ident, ...doc.sections.flatMap((s) => s.groups.flatMap((g) => g.items))].map((i) => i.key);
  const dupes = seen.filter((k, i) => seen.indexOf(k) !== i);
  const missing = (Object.keys(INTAKE_FIELDS) as FieldKey[]).filter((k) => !seen.includes(k));
  if (dupes.length) errors.push(`${lang}: keys used twice: ${dupes.join(", ")}`);
  if (missing.length) errors.push(`${lang}: fields not in the form: ${missing.join(", ")}`);
}

function compare(lang: IntakeLang, errors: string[]) {
  const all = docxLines(DOCX[lang]);
  const formAll = formLines(lang, errors);
  for (const l of RELOCATED) {
    if (all.includes(l) && !formAll.includes(l)) errors.push(`${lang}: "${l}" missing from the form`);
  }
  const actual = all.filter((l) => !RELOCATED.has(l));
  const expected = formAll.filter((l) => !RELOCATED.has(l));
  const n = Math.max(actual.length, expected.length);
  for (let i = 0; i < n; i++) {
    if (actual[i] !== expected[i]) {
      errors.push(`${lang}: line ${i + 1} differs\n    .docx: ${JSON.stringify(actual[i])}\n    form:  ${JSON.stringify(expected[i])}`);
      break; // later lines shift; the first difference is the useful one
    }
  }
  return all.length;
}

const errors: string[] = [];
for (const lang of ["en", "nl"] as const) checkKeys(lang, errors);
if (!existsSync(DOCX.en) || !existsSync(DOCX.nl)) {
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log("onboarding: SKIP label comparison (docs/onboarding/*.docx not present on this machine)");
  process.exit(0);
}
const counts = (["en", "nl"] as const).map((lang) => compare(lang, errors));
if (errors.length) {
  console.error("Onboarding form differs from the .docx:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(
  `onboarding OK — form matches the .docx word for word (EN ${counts[0]}, NL ${counts[1]} lines; ` +
    `${YES_NO_ADDED_IN_EN.length} EN questions with Yes/No options added, by decision).`,
);
