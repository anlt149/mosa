import styled from 'styled-components';

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  appearance: none;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #71717a;
  }
`;

export const Select = styled.select`
  width: 100%;
  min-width: 0;
  appearance: none;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.75rem;
  color: #fff;
  box-sizing: border-box;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &::placeholder {
    color: #71717a;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 1;
`;

export const CurrencySymbol = styled.span`
  position: absolute;
  right: 1rem;
  color: #a1a1aa;
  font-weight: 500;
  pointer-events: none;
`;

export const CostInput = styled(Input)`
  padding-right: 3rem;
`;
