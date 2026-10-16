"use client";

import { useActionState, useState, useTransition } from "react";
import type { InviteFormState } from "@/lib/intake/manage";
import type { InviteStatus } from "@/lib/intake/admin";
import { manage } from "./manage-client";
import { ShareResult } from "./ShareResult";

type ValidityOption = { value: string; label: string };
const INIT: InviteFormState = {};
const primary = "inline-flex min-h-11 items-center rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300 disabled:opacity-60";
const ghost = "inline-flex min-h-11 items-center rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800 disabled:opacity-60";

function Feedback({ state }: { state: InviteFormState }) {
  if (state.error) return <p role="alert" className="text-body-sm text-danger-night">{state.error}</p>;
  if (state.ok) return <p role="status" className="text-body-sm text-success-night">✓ {state.ok}</p>;
  return null;
}

function ValiditySelect({ id, options, defaultValue }: { id: string; options: readonly ValidityOption[]; defaultValue: string }) {
  return (
    <select id={id} name="validity" defaultValue={defaultValue} className="demo-input w-auto min-w-36">
      {options.map((v) => (
        <option key={v.value} value={v.value}>
          {v.label}
        </option>
      ))}
    </select>
  );
}

/** Manage one onboarding link: extend, new link, revoke, reopen. */
export function InviteActions({
  id,
  status,
  validity,
  defaultValidity,
}: {
  id: string;
  status: InviteStatus;
  validity: readonly ValidityOption[];
  defaultValidity: string;
}) {
  // fetch doesn't refresh the server-rendered details: reload with ?done=… so the page shows the new
  // state and the confirmation. (useRouter().refresh() would add 1 KB to every public page's JS.)
  const call = async (op: "extend" | "revoke" | "reopen", fd?: FormData) => {
    const result = await manage(op, id, fd);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload on purpose (see above)
    if (!result.error) window.location.assign(`${window.location.pathname}?done=${op}`);
    return result;
  };
  const [extendState, extend, extending] = useActionState((_: InviteFormState, fd: FormData) => call("extend", fd), INIT);
  // A new link is shown only once, so no reload here; the details refresh from the link below it.
  const [newState, regenerate, regenerating] = useActionState((_: InviteFormState, fd: FormData) => manage("regenerate", id, fd), INIT);
  const [simpleState, setSimpleState] = useState<InviteFormState>(INIT);
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);
  const [isBusy, startTransition] = useTransition();

  const run = (fn: () => Promise<InviteFormState>) =>
    startTransition(async () => {
      setSimpleState(await fn());
      setIsConfirmingRevoke(false);
    });

  return (
    <div className="flex flex-col gap-8">
      <form action={extend} className="flex flex-col gap-3">
        <label htmlFor="extend-validity" className="text-label text-paper-500">
          Extend the link
        </label>
        <div className="flex flex-wrap gap-2">
          <ValiditySelect id="extend-validity" options={validity} defaultValue={defaultValidity} />
          <button type="submit" disabled={extending} className={ghost}>
            {extending ? "Extending…" : "Extend"}
          </button>
        </div>
        <Feedback state={extendState} />
      </form>

      <form action={regenerate} className="flex flex-col gap-3">
        <label htmlFor="new-validity" className="text-label text-paper-500">
          New link (the current one stops working; answers are kept)
        </label>
        <div className="flex flex-wrap gap-2">
          <ValiditySelect id="new-validity" options={validity} defaultValue={defaultValidity} />
          <button type="submit" disabled={regenerating} className={ghost}>
            {regenerating ? "Creating…" : "Create new link"}
          </button>
        </div>
        <Feedback state={newState} />
        {newState.share && (
          <>
            <ShareResult share={newState.share} />
            <a href={`/dashboard/onboarding/${id}`} className="text-body-sm text-paper-300 underline underline-offset-4 hover:text-paper-50">
              Refresh details (after copying the link)
            </a>
          </>
        )}
      </form>

      <div className="flex flex-col gap-3 border-t border-line-night/50 pt-6">
        <div className="flex flex-wrap gap-2">
          {status === "submitted" && (
            <button type="button" disabled={isBusy} onClick={() => run(() => call("reopen"))} className={primary}>
              Reopen for editing
            </button>
          )}
          {status !== "revoked" && !isConfirmingRevoke && (
            <button type="button" disabled={isBusy} onClick={() => setIsConfirmingRevoke(true)} className={ghost}>
              Revoke link
            </button>
          )}
        </div>
        {isConfirmingRevoke && (
          <div role="alertdialog" aria-label="Revoke this link?" className="flex flex-col gap-3 rounded-lg border border-danger-night/60 p-4">
            <p className="text-body-sm">The client will see &quot;This link is no longer active&quot;. Answers are kept; you can create a new link later.</p>
            <div className="flex gap-2">
              <button type="button" disabled={isBusy} onClick={() => run(() => call("revoke"))} className="inline-flex min-h-11 items-center rounded-pill bg-danger-night px-5 text-body-sm font-semibold text-ink-900 disabled:opacity-60">
                Revoke
              </button>
              <button type="button" onClick={() => setIsConfirmingRevoke(false)} className={ghost}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <Feedback state={simpleState} />
      </div>
    </div>
  );
}
