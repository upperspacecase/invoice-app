"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  GoogleAuthProvider,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (!config.apiKey) {
    throw new Error(
      "Firebase web config missing — set NEXT_PUBLIC_FIREBASE_* env vars."
    );
  }
  app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

export const EMAIL_LINK_STORAGE_KEY = "invoice-app:email-link";

export async function sendMagicLink(email: string, redirectUrl: string) {
  const auth = getFirebaseAuth();
  await sendSignInLinkToEmail(auth, email, {
    url: redirectUrl,
    handleCodeInApp: true,
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
  }
}

export async function completeMagicLink(href: string) {
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, href)) return null;
  let email =
    typeof window !== "undefined"
      ? window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY)
      : null;
  if (!email) {
    email = window.prompt("Confirm your email to complete sign-in") ?? "";
  }
  if (!email) return null;
  const result = await signInWithEmailLink(auth, email, href);
  window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
  return result.user;
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export function watchUser(cb: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), cb);
}

export async function signOutClient() {
  await signOut(getFirebaseAuth());
}
