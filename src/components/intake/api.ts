// Browser client for /api/intake. Network failures throw (the autosave treats them as "offline").
import type { Answers } from "@/lib/intake/answers";
import type { IntakeResult } from "@/lib/intake/protocol";

async function call(action: "open" | "save" | "submit", token: string, answers?: Answers): Promise<IntakeResult> {
  const res = await fetch("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, token, answers }),
    cache: "no-store",
  });
  if (res.status >= 500) throw new Error(`intake ${action}: ${res.status}`);
  return (await res.json()) as IntakeResult;
}

export const intakeOpen = (token: string) => call("open", token);
export const intakeSave = (token: string, answers: Answers) => call("save", token, answers);
export const intakeSubmit = (token: string, answers: Answers) => call("submit", token, answers);
