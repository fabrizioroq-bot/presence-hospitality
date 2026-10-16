"use client";

import type { Shareable } from "@/lib/intake/manage";
import { CopyButton } from "../CopyButton";

const ghost = "inline-flex min-h-11 items-center rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800";

/** The new link (shown only now: the database keeps a hash) and the prefilled message to paste. */
export function ShareResult({ share }: { share: Shareable }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-success-night/50 bg-success-night/5 p-5 sm:p-6">
      <p className="text-body-sm text-paper-300">
        Copy the link now: for security it can&apos;t be shown again (you can always create a new one). Send it yourself by email or WhatsApp.
      </p>
      <div className="flex flex-col gap-2">
        <label htmlFor="share-link" className="text-label text-paper-500">
          Link
        </label>
        <div className="flex flex-wrap gap-2">
          <input id="share-link" readOnly value={share.link} onFocus={(e) => e.currentTarget.select()} className="demo-input min-w-0 flex-1 text-body-sm" />
          <CopyButton text={share.link} label="Copy link" className={ghost} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="share-message" className="text-label text-paper-500">
          Message ({share.lang === "nl" ? "Dutch" : "English"})
        </label>
        <textarea id="share-message" readOnly rows={12} value={share.message} className="demo-input resize-y text-body-sm" />
        <div>
          <CopyButton text={share.message} label="Copy message" className={ghost} />
        </div>
      </div>
    </div>
  );
}
