import React from 'react';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error cleanly for debugging
    console.error('Application Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-brand-cream px-4 py-16">
          <div className="max-w-xl w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 text-neutral-700 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                System Notice
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-neutral-900 tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                An unexpected issue occurred while rendering this page. Our technical team has been notified.
              </p>
            </div>

            {/* Subtle Divider */}
            <div className="border-b border-neutral-200 w-24 mx-auto" />

            {/* Action buttons adhering to strict editorial standards */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-neutral-300 text-neutral-800 text-xs uppercase tracking-wider font-medium hover:bg-neutral-100 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                Need immediate assistance? Contact{' '}
                <a
                  href="mailto:care@oct9.com"
                  className="text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                >
                  Customer Support (care@oct9.com)
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
