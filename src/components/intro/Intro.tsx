import { introScript } from "./intro-script";

/**
 * Branded intro loader. Only an inline script is rendered (first in <body>): on the first visit of
 * the session (`html.intro`, set by the boot script) it builds the loader outside React's tree and
 * paints before the rest of the HTML. The page renders behind it (see intro-script.ts).
 */
export function Intro({ caption }: { caption: string }) {
  return <script dangerouslySetInnerHTML={{ __html: introScript(caption) }} />;
}
