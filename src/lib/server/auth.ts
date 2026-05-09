import "server-only";
import { cookies } from "next/headers";
import {
  adminAuth,
  SESSION_COOKIE_NAME,
} from "@/lib/firebase/admin";
import {
  ensureUserSeeded,
  findApiKeyByToken,
  touchApiKey,
} from "./store";

export type SessionUser = {
  uid: string;
  email: string | null;
  name: string | null;
};

export type ApiAuthOk = {
  ok: true;
  uid: string;
  keyId: string;
};
export type ApiAuthErr = { ok: false; status: 401 | 403; message: string };

function extractBearer(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function authenticateApi(
  req: Request
): Promise<ApiAuthOk | ApiAuthErr> {
  const token = extractBearer(req);
  if (!token) {
    return { ok: false, status: 401, message: "Missing bearer token." };
  }
  const found = await findApiKeyByToken(token);
  if (!found) {
    return { ok: false, status: 403, message: "Invalid or revoked key." };
  }
  await touchApiKey(found.key.id);
  return { ok: true, uid: found.uid, keyId: found.key.id };
}

export function apiAuthError(err: ApiAuthErr): Response {
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

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Sign in to continue.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  await ensureUserSeeded(user.uid, { email: user.email, displayName: user.name });
  return user;
}
