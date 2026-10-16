// Shape of /api/intake responses, shared by the route handler and the browser client.
import type { RpcResult } from "./invites";

export type IntakeResult = { status: RpcResult | "invalid"; progress?: number; missing?: string[] };
