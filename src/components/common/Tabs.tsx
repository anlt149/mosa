import styled from 'styled-components';

export const TabContainer = styled.div`
  display: flex;
  background: #18181b;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  overflow-x: auto;
  
  /* hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  white-space: nowrap;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? '#27272a' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : '#a1a1aa'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #fff;
  }
`;
