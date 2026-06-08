import styled from 'styled-components';

export const Card = styled.div`
  background-color: #111;
  border: 1px solid #333;
  padding: 1.25rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
`;
