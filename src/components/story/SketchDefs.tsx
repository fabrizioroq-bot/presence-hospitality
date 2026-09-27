import { POSTER_COOL, POSTER_WARM } from "@/components/hologram/poster-points";
import { GUEST_BODY, GUEST_CASE } from "./guest-points";

/**
 * Dotted point paths for the lobby sketch (agent + guest), rendered once on the server and
 * referenced by the client-side <LobbySketch> via <use href="#ls-…">. Strokes come from the <use>.
 */
export function SketchDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      <defs>
        <path id="ls-cool" d={POSTER_COOL} />
        <path id="ls-warm" d={POSTER_WARM} />
        <path id="ls-guest-body" d={GUEST_BODY} />
        <path id="ls-guest-case" d={GUEST_CASE} />
      </defs>
    </svg>
  );
}
