import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutDashboard, HeartPulse, CheckCircle2, UtensilsCrossed, Receipt } from 'lucide-react';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom); /* For iOS home indicator */
`;

const NavItem = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  color: ${({ $active }) => $active ? '#10b981' : '#71717a'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  margin: 0;

  &:hover {
    color: ${({ $active }) => $active ? '#10b981' : '#e4e4e7'};
  }

  svg {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${({ $active }) => $active ? 'scale(1.15) translateY(-2px)' : 'scale(1) translateY(0)'};
    filter: ${({ $active }) => $active ? 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.4))' : 'none'};
  }
`;

const Label = styled.span<{ $active: boolean }>`
  font-size: 0.65rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  opacity: ${({ $active }) => $active ? '1' : '0.8'};
`;

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <NavContainer>
      <NavItem 
        $active={path === '/'} 
        onClick={() => navigate('/')}
        aria-label="Overview"
      >
        <LayoutDashboard size={22} strokeWidth={path === '/' ? 2.5 : 2} />
        <Label $active={path === '/'}>Overview</Label>
      </NavItem>

      <NavItem 
        $active={path === '/mood' || path === '/journal'} 
        onClick={() => navigate('/mood')}
        aria-label="Mood"
      >
        <HeartPulse size={22} strokeWidth={path === '/mood' ? 2.5 : 2} />
        <Label $active={path === '/mood'}>Mood</Label>
      </NavItem>

      <NavItem 
        $active={path === '/habits'} 
        onClick={() => navigate('/habits')}
        aria-label="Habits"
      >
        <CheckCircle2 size={22} strokeWidth={path === '/habits' ? 2.5 : 2} />
        <Label $active={path === '/habits'}>Habits</Label>
      </NavItem>

      <NavItem 
        $active={path === '/meals'} 
        onClick={() => navigate('/meals')}
        aria-label="Meals"
      >
        <UtensilsCrossed size={22} strokeWidth={path === '/meals' ? 2.5 : 2} />
        <Label $active={path === '/meals'}>Meals</Label>
      </NavItem>

      <NavItem 
        $active={path === '/bills'} 
        onClick={() => navigate('/bills')}
        aria-label="Bills"
      >
        <Receipt size={22} strokeWidth={path === '/bills' ? 2.5 : 2} />
        <Label $active={path === '/bills'}>Bills</Label>
      </NavItem>
    </NavContainer>
  );
}
