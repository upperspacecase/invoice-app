"use client";

import { useEffect } from "react";

// Catches errors that escape the app's render tree. Logging here surfaces them
// in Vercel's runtime logs/observability (our "basic error monitoring"); swap
// the console.error for a Sentry call if a DSN is added later.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[nudge] unhandled error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf4e9",
          color: "#1e3d2b",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
            Something went sideways.
          </h1>
          <p style={{ fontSize: 14, color: "rgba(30,61,43,0.7)", margin: "0 0 20px" }}>
            Nudge hit an unexpected error. Your invoices are safe — try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#46b36b",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
