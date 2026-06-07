import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { AppHeader } from './components/AppHeader';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
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
                <Dashboard />
              </AppShell>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
