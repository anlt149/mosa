import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppHeader } from './components/AppHeader';
import { FullScreenSpinner } from './components/common';
import styled from 'styled-components';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const YearInPixels = lazy(() => import('./pages/YearInPixels').then(m => ({ default: m.YearInPixels })));
const Habits = lazy(() => import('./pages/Habits').then(m => ({ default: m.Habits })));

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  return (
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
