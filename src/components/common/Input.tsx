import styled from 'styled-components';

export const Input = styled.input`
  background-color: #000;
  color: #fff;
  border: 1px solid #333;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #fff;
  }

  &::placeholder {
    color: #666;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #aaa;
  margin-bottom: 0.5rem;
`;
