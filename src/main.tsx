import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";
import { db } from "./services/dbService";

// Initialize the encrypted global database on app boot (no-op in browser
// dev mode — `db.init()` checks for the Tauri env first).
void db.init().catch((err) => {
  console.error("[CastOverlay] db.init failed", err);
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[CastOverlay] Fatal:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#07090E",
            color: "#f87171",
            fontFamily: "monospace",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
            CastOverlay – kritická chyba
          </h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
            V okne došlo k chybe – detail nižšie.
          </p>
          <pre
            style={{
              fontSize: 11,
              color: "#fca5a5",
              background: "#111827",
              padding: 16,
              borderRadius: 8,
              maxWidth: 640,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.message || "neznáma chyba"}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global safety nets: surface any unhandled error in the WebView console
// (window.onerror must be set before React mounts so it catches early failures)
const windowAny = window as any;
windowAny.onerror = (msg: any, src: any, line: any, col: any, err: any) => {
  console.error("[CastOverlay][window.onerror]", String(msg), src, line, col, err);
  return false;
};
windowAny.onunhandledrejection = (e: any) => {
  console.error("[CastOverlay][unhandledrejection]", e.reason ?? e);
};

const root = document.getElementById("root");
if (!root) {
  // root element missing (index.html not loaded) — show a clear error so
  // the user isn't left staring at a blank/black window
  document.body.style.background = "#07090E";
  document.body.style.color = "#f87171";
  document.body.style.fontFamily = "monospace";
  document.body.style.margin = "0";
  document.body.style.padding = "24px";
  document.body.appendChild(
    Object.assign(document.createElement("pre"), {
      textContent:
        "CastOverlay – #root not found.\nCheck: npm run build && dist/ contains index.html and assets.",
    })
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
