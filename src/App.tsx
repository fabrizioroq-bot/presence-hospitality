import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';

// Lazy-loaded: these pull in the Supabase client, which is only needed
// past the landing page (and must not break "/" when Supabase env vars
// aren't configured yet).
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <p className="text-sm text-white/40">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <Suspense fallback={<RouteFallback />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<RouteFallback />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        }
      />
    </Routes>
  );
}
