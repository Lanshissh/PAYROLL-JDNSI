import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep it simple: log to console for now.
    // Later you can send this to an audit/logging endpoint if you want.
    console.error("UI crash:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 24, maxWidth: 760 }}>
        <h2 style={{ marginBottom: 8 }}>Something went wrong.</h2>
        <p style={{ marginTop: 0 }}>
          Please refresh the page. If it keeps happening, contact support.
        </p>

        {this.state.error?.message ? (
          <details style={{ marginTop: 12 }}>
            <summary>Error details</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>
          </details>
        ) : null}

        <button style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}