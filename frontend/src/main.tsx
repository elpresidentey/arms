import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'

// Initialize Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
  console.log('Sentry initialized for error monitoring');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 80 }}
          toastOptions={{
            duration: 3500,
            style: {
              width: 'min(520px, calc(100vw - 32px))',
              maxWidth: 'min(520px, calc(100vw - 32px))',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 14px 40px rgba(15, 23, 42, 0.12)',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
              lineHeight: '1.45',
            },
            success: {
              iconTheme: {
                primary: '#166534',
                secondary: '#ecfdf5',
              },
            },
            error: {
              iconTheme: {
                primary: '#be123c',
                secondary: '#fff1f2',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
