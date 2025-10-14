import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isReloading: false
    };
  }

  static getDerivedStateFromError(error) {
    console.error("Caught error in getDerivedStateFromError:", error);
    return { hasError: true };
    
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ isReloading: true });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      //const isDevelopment = process.env.NODE_ENV === 'development';
      const isDevelopment =import.meta.env.MODE ==='development';
      //const isDevelopment = import.meta.env.VITE_ENV === 'development';
   //✅ Note: Vite only exposes environment variables prefixed with VITE_.

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-100">
              <div className="text-center mb-8">
                <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
                <p className="text-gray-600 text-lg">
                  We encountered an unexpected error. Don&apos;t worry, we&apos;re here to help!
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Bug className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Development Info</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong className="text-red-600">Error:</strong>
                      <p className="text-gray-700 font-mono bg-white p-2 rounded border mt-1">
                        {this.state.error.toString()}
                      </p>
                    </div>
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong className="text-red-600">Component Stack:</strong>
                        <pre className="text-gray-700 font-mono bg-white p-2 rounded border mt-1 text-xs overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={this.handleReload}
                    disabled={this.state.isReloading}
                    className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      this.state.isReloading
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <RefreshCw className={`w-5 h-5 ${this.state.isReloading ? 'animate-spin' : ''}`} />
                    {this.state.isReloading ? 'Reloading...' : 'Reload Page'}
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Home className="w-5 h-5" />
                    Go to Homepage
                  </button>
                </div>

                {/* Additional Help Options */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-4 text-center">Need More Help?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="mailto:support@yourapp.com"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </a>
                    
                    <button
                      onClick={() => {
                        if (navigator.onLine) {
                          window.location.reload();
                        } else {
                          alert('Please check your internet connection and try again.');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Check Connection
                    </button>
                  </div>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Quick Fixes to Try:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Refresh the page (F5 or Ctrl+R)</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Try using a different browser</li>
                  <li>• Check your internet connection</li>
                  <li>• Disable browser extensions temporarily</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-sm text-gray-500">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;