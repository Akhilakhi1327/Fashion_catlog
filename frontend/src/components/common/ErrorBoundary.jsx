import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          padding: '2rem',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.5rem',
            padding: '3rem',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          }}>
            {/* Animated error icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              boxShadow: '0 0 30px rgba(244,63,94,0.3)',
            }}>
              ⚠️
            </div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              Something went wrong
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              We encountered an unexpected error while rendering this page. 
              Our team has been notified. Please try refreshing.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.875rem 2rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ↻ Return to Home
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
                <summary style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Developer Info
                </summary>
                <pre style={{
                  color: '#f87171',
                  fontSize: '0.7rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  marginTop: '0.5rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
