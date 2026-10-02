"use client";

import { useActionState, useState } from "react";
import {
  deleteLead,
  updateLead,
  type FormState,
} from "@/app/dashboard/actions";

type Opt = { value: string; label: string };

export function LeadEditor({
  id,
  status,
  notes,
  options,
}: {
  id: string;
  status: string;
  notes: string;
  options: Opt[];
}) {
  const [state, action, pending] = useActionState(
    updateLead.bind(null, id),
    {} as FormState,
  );
  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-body-sm font-semibold">
        Status
        <select name="status" defaultValue={status} className="demo-input">
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-body-sm font-semibold">
        Internal notes
        <textarea
          name="notes"
          defaultValue={notes}
          rows={6}
          maxLength={5000}
          placeholder="Call notes, next steps…"
          className="demo-input resize-y"
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-pill bg-paper-50 px-6 text-body-sm font-semibold text-ink-900 hover:bg-paper-300 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <span role="status" className="text-body-sm">
          {state.ok && <span className="text-success-night">✓ {state.ok}</span>}
          {state.error && (
            <span className="text-danger-night">{state.error}</span>
          )}
        </span>
      </div>
    </form>
  );
}

/** Two-step delete (GDPR erasure requests, test data). */
export function DeleteLead({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, setPending] = useState(false);
  if (!armed)
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="min-h-11 rounded-pill px-5 text-body-sm font-semibold text-danger-night ring-1 ring-danger-night/60 hover:bg-danger-night/10"
      >
        Delete lead…
      </button>
    );
  return (
    <form
      action={async () => {
        setPending(true);
        await deleteLead(id);
      }}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-danger-night/60 bg-danger-night/10 p-4"
    >
      <p className="text-body-sm">
        This permanently deletes the lead. It can&apos;t be undone.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-pill bg-danger-night px-5 text-body-sm font-semibold text-ink-900 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete permanently"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="min-h-10 rounded-pill px-4 text-body-sm ring-1 ring-line-night"
      >
        Cancel
      </button>
    </form>
  );
}
