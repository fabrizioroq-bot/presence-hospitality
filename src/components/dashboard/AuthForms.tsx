"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  acceptLink,
  requestReset,
  setPassword,
  signIn,
  type FormState,
} from "@/app/dashboard/actions";

const INIT: FormState = {};

function Message({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p
        role="alert"
        className="rounded-md border border-danger-night/60 bg-danger-night/10 p-3 text-body-sm text-paper-50"
      >
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p
        role="status"
        className="rounded-md border border-success-night/50 bg-success-night/10 p-3 text-body-sm text-paper-50"
      >
        {state.ok}
      </p>
    );
  return null;
}

function Submit({ pending, children }: { pending: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-paper-50 px-6 font-semibold text-ink-900 transition-colors hover:bg-paper-300 disabled:opacity-60"
    >
      {pending && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/25 border-t-ink-900"
        />
      )}
      {children}
    </button>
  );
}

const input = "demo-input";
const label = "text-body-sm font-semibold";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState(
    signIn,
    initialError ? { error: initialError } : INIT,
  );
  return (
    <form action={action} className="flex flex-col gap-5">
      <Message state={state} />
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={input}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </div>
      <Submit pending={pending}>Sign in</Submit>
      <Link
        href="/dashboard/forgot"
        className="self-center text-body-sm text-paper-300 underline underline-offset-4 hover:text-paper-50"
      >
        Forgot your password?
      </Link>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestReset, INIT);
  return (
    <form action={action} className="flex flex-col gap-5">
      <Message state={state} />
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={input}
        />
      </div>
      <Submit pending={pending}>Send reset link</Submit>
      <Link
        href="/dashboard/login"
        className="self-center text-body-sm text-paper-300 underline underline-offset-4 hover:text-paper-50"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, INIT);
  return (
    <form action={action} className="flex flex-col gap-5">
      <Message state={state} />
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={label}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          aria-describedby="pw-hint"
          className={input}
        />
        <p id="pw-hint" className="text-body-sm text-paper-500">
          At least 12 characters, with upper- and lowercase letters and a
          number.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className={label}>
          Repeat password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className={input}
        />
      </div>
      <Submit pending={pending}>Save password</Submit>
    </form>
  );
}

function ContinueButton() {
  const { pending } = useFormStatus();
  return <Submit pending={pending}>Continue</Submit>;
}

/** Invite / reset links: the one-time token is only used when this button is clicked. */
export function AcceptLinkForm({ tokenHash, type }: { tokenHash: string; type: "invite" | "recovery" }) {
  return (
    <form action={acceptLink}>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <ContinueButton />
    </form>
  );
}
