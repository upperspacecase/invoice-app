import "server-only";
import type { ApiKey } from "../types";
import { findApiKeyByToken, touchApiKey } from "./store";

export type AuthOk = { ok: true; key: ApiKey };
export type AuthErr = { ok: false; status: 401 | 403; message: string };
export type AuthResult = AuthOk | AuthErr;

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export function authenticate(req: Request): AuthResult {
  const token = extractBearer(req);
  if (!token) {
    return { ok: false, status: 401, message: "Missing bearer token." };
  }
  const key = findApiKeyByToken(token);
  if (!key) {
    return { ok: false, status: 403, message: "Invalid or revoked key." };
  }
  touchApiKey(key.id);
  return { ok: true, key };
}

export function authError(err: AuthErr): Response {
  return Response.json(
    { error: err.message },
    {
      status: err.status,
      headers:
        err.status === 401
          ? { "WWW-Authenticate": 'Bearer realm="invoice-app"' }
          : undefined,
    }
  );
}
