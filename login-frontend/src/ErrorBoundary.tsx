import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center backdrop-blur-sm shadow-2xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4 tracking-tight">Oops, something went wrong.</h1>
            <p className="text-gray-300 mb-6 font-medium">The application experienced a critical failure. The system has prevented a freeze.</p>
            <div className="bg-gray-800/80 text-left p-4 rounded-xl mb-6 overflow-auto text-sm text-red-300 font-mono ring-1 ring-red-500/30">
              <code>{this.state.errorMsg || "Unknown Error"}</code>
            </div>
            <button
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-center mx-auto space-x-2"
              onClick={() => window.location.reload()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
