import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff3333', backgroundColor: '#1a1a1a', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Crashed</h1>
          <div style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px', overflow: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Error Name: {this.state.error?.name}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#ffaaaa' }}>Message: {this.state.error?.message}</p>
            <pre style={{ margin: 0, color: '#ccc', fontSize: '12px' }}>{this.state.error?.stack}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
