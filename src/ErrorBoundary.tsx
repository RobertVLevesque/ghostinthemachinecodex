import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Ghost UI] runtime failure", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-200">
          <div className="fixed left-1/2 top-6 z-[60] w-[min(90vw,420px)] -translate-x-1/2 rounded-2xl border border-red-500/40 bg-red-900/30 p-4 text-center shadow-[0_0_30px_rgba(255,60,60,0.25)] backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-red-300">system fault</p>
            <p className="mt-2 text-sm text-red-200/80">
              An unexpected glitch occurred. Check the console for diagnostics and reload to try again.
            </p>
            {this.state.error?.message ? (
              <p className="mt-3 break-words text-[0.7rem] text-red-200/60">{this.state.error.message}</p>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
