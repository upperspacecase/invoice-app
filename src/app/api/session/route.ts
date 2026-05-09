import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  adminAuth,
} from "@/lib/firebase/admin";

export async function POST(req: Request) {
  let body: { idToken?: string };
  try {
    body = (await req.json()) as { idToken?: string };
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const idToken = body.idToken;
  if (!idToken) {
    return Response.json({ error: "idToken is required." }, { status: 400 });
  }

  let cookie: string;
  try {
    cookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE,
    });
  } catch {
    return Response.json(
      { error: "Could not verify ID token." },
      { status: 401 }
    );
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE / 1000,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true });
}
