import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppHeader } from './components/AppHeader';
import { FullScreenSpinner } from './components/common';
import styled from 'styled-components';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
// import { YearInPixels } from './pages/YearInPixels';
import { Habits } from './pages/Habits';
import { Meals } from './pages/Meals';
import { FixedCosts } from './pages/FixedCosts';

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
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
            path="/bills"
            element={
              <AuthGuard>
                <AppShell>
                  <AppHeader />
                  <FixedCosts />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
