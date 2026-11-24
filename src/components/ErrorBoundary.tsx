import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AgriGuard-AI UI boundary caught an error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('agriguard_workspace_v1');
    } catch {
      // ignore storage restrictions
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#1B3D2B] px-4 py-8 text-[#14291D]">
          <div className="w-full max-w-md rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 shadow-md">
            <div className="flex items-center gap-2.5 text-[#143D2B]">
              <ShieldAlert className="h-6 w-6 shrink-0 text-[#B45309]" aria-hidden="true" />
              <div>
                <h1 className="font-display text-lg font-bold">
                  AgriGuard-AI · Rythu Suraksha
                </h1>
                <p className="text-xs text-[#355240]">Workspace recovery</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#243F2F]">
              Something interrupted this view cleanly. Reload the page to continue safely, or reset saved local farm data if the issue persists.
            </p>
            {this.state.errorMessage && (
              <p className="mt-2 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-3 py-2 font-mono text-xs text-[#355240]">
                {this.state.errorMessage}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#143D2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2D20] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="inline-flex min-h-[40px] items-center rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-4 py-2 text-sm font-medium text-[#14291D] hover:bg-[#C8DCCB] cursor-pointer"
              >
                Reset Local Data &amp; Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
