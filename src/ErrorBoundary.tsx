import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo?: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[ErrorBoundary] Unhandled promise rejection:', event.reason);
    if (event.reason instanceof Error) {
      this.setState({
        hasError: true,
        error: event.reason
      });
    } else {
      this.setState({
        hasError: true,
        error: new Error(String(event.reason || 'Unhandled Promise Rejection'))
      });
    }
  };

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('[ErrorBoundary] Global runtime error:', event.error || event.message);
    this.setState({
      hasError: true,
      error: event.error || new Error(event.message || 'Global Runtime Error')
    });
  };

  public componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.addEventListener('error', this.handleGlobalError);
  }

  public componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleGlobalError);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '640px',
            width: '100%',
            backgroundColor: '#1e293b',
            border: '2px solid #ef4444',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                Jesse Math FC — Recovery Shield
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              An unexpected runtime initialization error occurred. The application was prevented from blanking out.
            </p>
            <div style={{
              backgroundColor: '#0f172a',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid #334155',
              overflowX: 'auto',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: '#f87171', fontWeight: '700', fontSize: '0.875rem', margin: 0 }}>
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </p>
              {this.state.error?.stack && (
                <pre style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reset Storage & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

