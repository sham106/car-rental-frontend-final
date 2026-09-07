import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-white rounded-2xl border border-[#DCE2E6] shadow-sm max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FDEDEC] text-[#B9534F] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#24313A]">
            {this.props.fallbackTitle || 'Unable to display this view'}
          </h2>
          <p className="text-xs text-[#65727B] max-w-md mx-auto">
            A temporary issue occurred while rendering this section:
            <span className="block mt-1 font-mono text-[11px] text-[#B9534F] bg-[#FDEDEC] p-2 rounded-lg break-all">
              {this.state.error?.message || 'Unexpected application error'}
            </span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry / Refresh</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
