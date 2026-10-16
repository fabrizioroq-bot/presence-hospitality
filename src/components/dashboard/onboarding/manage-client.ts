// Browser side of /dashboard/onboarding/manage. Always resolves: failures come back as { error }.
import type { InviteFormState } from "@/lib/intake/manage";

type Op = "create" | "extend" | "regenerate" | "revoke" | "reopen";

export async function manage(op: Op, id?: string, form?: FormData): Promise<InviteFormState> {
  const fields = form ? Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")) : {};
  try {
    const res = await fetch("/dashboard/onboarding/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op, id, fields }),
    });
    return (await res.json()) as InviteFormState;
  } catch {
    return { error: "Couldn't reach the server. Check your connection and try again." };
  }
}
