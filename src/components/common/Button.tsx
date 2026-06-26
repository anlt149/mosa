import styled from 'styled-components';

export const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'outline' | 'ghost' }>`
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#3b82f6';
      case 'danger': return '#ef4444';
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return '#27272a';
    }
  }};
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'outline': return '#a1a1aa';
      case 'ghost': return '#a1a1aa';
      default: return '#fff';
    }
  }};
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'outline': return '#3f3f46';
      case 'primary':
      case 'danger':
      case 'ghost':
        return 'transparent';
      default: return 'transparent';
    }
  }};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ $variant }) => {
      switch ($variant) {
        case 'primary': return '#2563eb';
        case 'danger': return '#dc2626';
        case 'outline': return '#27272a';
        case 'ghost': return '#27272a';
        default: return '#3f3f46';
      }
    }};
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const OutlineButton = styled(Button).attrs({ $variant: 'outline' })``;

export const ActionBtn = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: #27272a;
  }
`;
