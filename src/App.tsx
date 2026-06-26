import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGuard } from './components/AuthGuard';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { FullScreenSpinner } from './components/common';
import styled from 'styled-components';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't aggressively refetch unless necessary
    },
  },
});

const Overview = lazy(() => import('./pages/Overview').then(module => ({ default: module.Overview })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Habits = lazy(() => import('./pages/Habits').then(module => ({ default: module.Habits })));
const Meals = lazy(() => import('./pages/Meals').then(module => ({ default: module.Meals })));
const ExpenseTracker = lazy(() => import('./pages/ExpenseTracker').then(module => ({ default: module.ExpenseTracker })));
const Tasks = lazy(() => import('./pages/Tasks').then(module => ({ default: module.Tasks })));

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding-bottom: calc(70px + env(safe-area-inset-bottom));
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<FullScreenSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <Overview />
                </AppShell>
              </AuthGuard>
            }
          />
          <Route
            path="/mood"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <Dashboard />
                </AppShell>
              </AuthGuard>
            }
          />
          <Route
            path="/habits"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <Habits />
                </AppShell>
              </AuthGuard>
            }
          />
          <Route
            path="/meals"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <Meals />
                </AppShell>
              </AuthGuard>
            }
          />
          <Route
            path="/expenses"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <ExpenseTracker />
                </AppShell>
              </AuthGuard>
            }
          />
          <Route
            path="/tasks"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <Tasks />
                </AppShell>
              </AuthGuard>
            }
          />
          {/*
          <Route
            path="/year"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <YearInPixels />
                </AppShell>
              </AuthGuard>
            }
          />
          */}
        </Routes>
        <BottomNav />
      </Suspense>
      <Toaster theme="dark" richColors position="bottom-right" />
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
