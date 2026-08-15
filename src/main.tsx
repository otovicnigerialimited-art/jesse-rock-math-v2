import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

console.log('[JesseMath] Initializing React application root...');

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

