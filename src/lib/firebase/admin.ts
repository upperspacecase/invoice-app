import "server-only";
import {
  type App,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS as SESSION_MAX_AGE,
} from "./session";

declare global {
  var __invoiceAppFirebaseAdmin: App | undefined;
}

function load(): App {
  if (globalThis.__invoiceAppFirebaseAdmin) {
    return globalThis.__invoiceAppFirebaseAdmin;
  }
  const existing = getApps()[0];
  if (existing) {
    globalThis.__invoiceAppFirebaseAdmin = existing;
    return existing;
  }
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_ADMIN_KEY env var is missing — required for the admin SDK."
    );
  }
  let parsed: { project_id: string; client_email: string; private_key: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY is not valid JSON.");
  }
  const app = initializeApp({
    credential: cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    }),
    projectId: parsed.project_id,
  });
  globalThis.__invoiceAppFirebaseAdmin = app;
  return app;
}

export function adminApp(): App {
  return load();
}

export function adminAuth(): Auth {
  return getAuth(load());
}

export function adminDb(): Firestore {
  return getFirestore(load());
}

// Default Storage bucket for uploaded invoice PDFs. The admin SDK bypasses
// Storage security rules, so server-only access needs no rules file. The
// bucket name isn't set in initializeApp, so pass it explicitly.
export function adminBucket() {
  const name = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!name) {
    throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET env var is missing.");
  }
  return getStorage(load()).bucket(name);
}

