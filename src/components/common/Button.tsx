import styled from 'styled-components';

export const Button = styled.button`
  background-color: #fff;
  color: #000;
  border: 2px solid #fff;
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    background-color: #000;
    color: #fff;
  }

  &:disabled {
    background-color: #333;
    color: #666;
    border-color: #333;
    cursor: not-allowed;
  }
`;

export const OutlineButton = styled(Button)`
  background-color: transparent;
  color: #fff;

  &:hover {
    background-color: #fff;
    color: #000;
  }
`;
