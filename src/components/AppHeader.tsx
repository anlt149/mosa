import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Styled components ─────────────────────────────────────── */

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: #000;
  border-bottom: 1px solid #222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  height: 52px;
  box-sizing: border-box;
`;

const NavTabs = styled.nav`
  display: flex;
  gap: 0.25rem;
  margin-left: 1.5rem;
  height: 100%;
  align-items: center;

  @media (max-width: 480px) {
    margin-left: 0.5rem;
    gap: 0.1rem;
  }
`;

const NavTabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#10b981' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#777'};
  height: 52px;
  padding: 0 0.8rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:hover {
    color: #fff;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0 0.4rem;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  user-select: none;
`;

const BrandLogo = styled.svg`
  flex-shrink: 0;
`;

const BrandName = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #fff;
  text-transform: lowercase;
`;

const MenuButton = styled.button`
  background: none;
  border: 2px solid #333;
  color: #aaa;
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    border-color: #fff;
    color: #fff;
  }
`;

const Burger = styled.span<{ $open: boolean }>`
  display: block;
  width: 16px;
  height: 2px;
  background: currentColor;
  transition: transform 0.2s, opacity 0.2s;

  &:nth-child(1) {
    transform: ${p => p.$open ? 'translateY(7px) rotate(45deg)' : 'none'};
  }
  &:nth-child(2) {
    opacity: ${p => p.$open ? 0 : 1};
  }
  &:nth-child(3) {
    transform: ${p => p.$open ? 'translateY(-7px) rotate(-45deg)' : 'none'};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 1.25rem;
  background: #111;
  border: 1px solid #333;
  min-width: 160px;
  animation: ${fadeIn} 0.15s ease;
`;

const DropdownItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  background: ${p => p.$active ? '#161616' : 'none'};
  border: none;
  color: ${p => p.$active ? '#fff' : '#ccc'};
  font-family: inherit;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: #1a1a1a;
    color: #fff;
  }
`;

const DropdownDivider = styled.hr`
  border: none;
  border-top: 1px solid #222;
  margin: 0;
`;

/* ── Component ─────────────────────────────────────────────── */

interface AppHeaderProps {
  onLogout?: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Bar>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Brand style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/')}>
        <BrandLogo
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          aria-hidden="true"
        >
          <rect width="32" height="32" fill="#000"/>
          <rect x="2"  y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="8"  y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="14" y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="20" y="2"  width="5" height="5" rx="1" fill="#39d353"/>
          <rect x="26" y="2"  width="4" height="5" rx="1" fill="#39d353"/>
          <rect x="2"  y="8"  width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="8"  y="8"  width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="14" y="8"  width="5" height="5" rx="1" fill="#26a641"/>
          <rect x="20" y="8"  width="5" height="5" rx="1" fill="#26a641"/>
          <rect x="26" y="8"  width="4" height="5" rx="1" fill="#39d353"/>
          <rect x="2"  y="14" width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="8"  y="14" width="5" height="5" rx="1" fill="#006d32"/>
          <rect x="14" y="14" width="5" height="5" rx="1" fill="#26a641"/>
          <rect x="20" y="14" width="5" height="5" rx="1" fill="#26a641"/>
          <rect x="26" y="14" width="4" height="5" rx="1" fill="#26a641"/>
          <rect x="2"  y="20" width="5" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="8"  y="20" width="5" height="5" rx="1" fill="#006d32"/>
          <rect x="14" y="20" width="5" height="5" rx="1" fill="#006d32"/>
          <rect x="20" y="20" width="5" height="5" rx="1" fill="#006d32"/>
          <rect x="26" y="20" width="4" height="5" rx="1" fill="#1a1a1a"/>
          <rect x="2"  y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
          <rect x="8"  y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
          <rect x="14" y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
          <rect x="20" y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
          <rect x="26" y="26" width="4" height="4" rx="1" fill="#1a1a1a"/>
        </BrandLogo>
        <BrandName>mosa</BrandName>
      </Brand>
      <NavTabs>
        <NavTabButton
          $active={location.pathname === '/' || location.pathname === '/journal'}
          onClick={() => handleNavigate('/')}
        >
          Mood
        </NavTabButton>
        <NavTabButton
          $active={location.pathname === '/habits'}
          onClick={() => handleNavigate('/habits')}
        >
          Habits
        </NavTabButton>
        <NavTabButton
          $active={location.pathname === '/year'}
          onClick={() => handleNavigate('/year')}
        >
          Year
        </NavTabButton>
      </NavTabs>
    </div>

      {/* Hamburger menu */}
      <div ref={ref} style={{ position: 'relative' }}>
        <MenuButton
          onClick={() => setOpen(o => !o)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Burger $open={open} />
          <Burger $open={open} />
          <Burger $open={open} />
        </MenuButton>

        {open && (
          <Dropdown>
            <DropdownItem onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem style={{ color: '#555', fontSize: '0.75rem', cursor: 'default' }} onClick={() => {}}>
              v0.1.0
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </Bar>
  );
}
