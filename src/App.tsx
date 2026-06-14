import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppHeader } from './components/AppHeader';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { YearInPixels } from './pages/YearInPixels';
import { Habits } from './pages/Habits';
import { Home } from './pages/Home';
import styled from 'styled-components';

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell>
                <AppHeader />
                <Home />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/journal"
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
