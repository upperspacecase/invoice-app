// Plain constants safe for Edge runtime (middleware) and the client.
// Keep this file free of Node-only imports.
export const SESSION_COOKIE_NAME = "invoice-app-session";
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 14 * 1000; // 14 days
