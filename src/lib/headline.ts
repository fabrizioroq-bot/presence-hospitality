/**
 * Splits a headline with a single `<em>…</em>` phrase into word groups.
 * A group is rendered as one unbreakable unit, which keeps an emphasised word
 * glued to an attached suffix (e.g. NL "<em>receptie</em>personeel").
 */
export type HeadlineWord = { parts: { text: string; em: boolean }[]; glued: boolean };

export function splitHeadline(raw: string): HeadlineWord[] {
  const match = raw.match(/^([\s\S]*?)<em>([\s\S]*?)<\/em>([\s\S]*)$/);
  const segments = match
    ? [
        { text: match[1], em: false },
        { text: match[2], em: true },
        { text: match[3], em: false },
      ]
    : [{ text: raw, em: false }];

  const words: HeadlineWord[] = [];
  let glue = false; // true when the previous segment ended mid-word
  for (const seg of segments) {
    if (!seg.text) continue;
    // The emphasised phrase stays one unit; plain text splits on whitespace.
    const tokens = seg.em ? [seg.text.trim()] : seg.text.split(/(\s+)/);
    const startsWithSpace = /^\s/.test(seg.text);
    tokens.forEach((tok, i) => {
      if (/^\s+$/.test(tok)) {
        glue = false;
        return;
      }
      if (!tok) return;
      const attach = glue && !(i === 0 && startsWithSpace) && words.length > 0;
      if (attach) {
        const w = words[words.length - 1];
        // Soft hyphen lets a long compound (NL "receptie-personeel") break on narrow screens.
        w.parts.push({ text: "\u00AD" + tok, em: seg.em });
        w.glued = true;
      } else {
        words.push({ parts: [{ text: tok, em: seg.em }], glued: false });
      }
      glue = i === tokens.length - 1 && !/\s$/.test(seg.text);
    });
  }
  return words;
}

export const stripEm = (raw: string) => raw.replace(/<\/?em>/g, "");
