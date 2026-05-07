"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#09090b", color: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#71717a", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
            Critical error
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>
            Something broke
          </h1>
          <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 24 }}>
            We&apos;ve been notified. Try refreshing the page — if it keeps happening, email us at support@heatrankai.com.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace", marginBottom: 24 }}>
              ref: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{ padding: "10px 20px", borderRadius: 12, background: "#fafafa", color: "#09090b", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(255,255,255,0.04)", color: "#d4d4d8", fontSize: 14, fontWeight: 500, border: "1px solid rgba(255,255,255,0.10)", textDecoration: "none" }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
