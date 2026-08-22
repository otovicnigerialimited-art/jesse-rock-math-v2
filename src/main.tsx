import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

console.log('[JesseMath] Initializing React application root...');

// Register Service Worker for Push API & Background Notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('[JesseMath] Service Worker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('[JesseMath] Service Worker registration failed:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[JesseMath] CRITICAL: #root element not found in DOM!');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('[JesseMath] React root successfully mounted.');
  } catch (err) {
    console.error('[JesseMath] Error during createRoot.render():', err);
  }
}

