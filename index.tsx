import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <App />
        <SpeedInsights />
        <Analytics />
      </HelmetProvider>
    </GlobalErrorBoundary>

  </React.StrictMode>
);
