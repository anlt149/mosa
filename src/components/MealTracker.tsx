import React, { useState } from 'react';
import styled from 'styled-components';
import { Home, UtensilsCrossed, Loader2, CheckCircle2 } from 'lucide-react';
import { mealService } from '../services/mealService';

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  
  svg {
    color: #10b981;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OptionButton = styled.button<{ $active: boolean; $type: 'eat_home' | 'eat_out' }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${({ $active, $type }) => {
    if (!$active) return '#18181b';
    return $type === 'eat_home' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)';
  }};
  border: 1px solid ${({ $active, $type }) => {
    if (!$active) return '#27272a';
    return $type === 'eat_home' ? '#10b981' : '#f97316';
  }};
  color: ${({ $active, $type }) => {
    if (!$active) return '#a1a1aa';
    return $type === 'eat_home' ? '#10b981' : '#f97316';
  }};
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active, $type }) => {
      if (!$active) return '#27272a';
      return $type === 'eat_home' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)';
    }};
    color: ${({ $active, $type }) => {
      if (!$active) return '#fff';
      return $type === 'eat_home' ? '#10b981' : '#f97316';
    }};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  color: #a1a1aa;
  font-size: 0.9rem;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const CurrencySymbol = styled.span`
  position: absolute;
  right: 1rem;
  color: #a1a1aa;
  font-weight: 500;
  pointer-events: none;
`;

const StyledInput = styled.input`
  width: 100%;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 0.875rem 3rem 0.875rem 1rem;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
  
  &::placeholder {
    color: #52525b;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #10b981;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.875rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  justify-content: center;
  font-weight: 600;
  padding: 1rem;
`;

interface MealTrackerProps {
  onMealLogged?: () => void;
}

export function MealTracker({ onMealLogged }: MealTrackerProps) {
  const [mealName, setMealName] = useState('');
  const [locationType, setLocationType] = useState<'eat_out' | 'eat_home'>('eat_home');
  const [costInput, setCostInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digits
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setCostInput('');
      return;
    }
    
    // Format with commas
    const formatted = parseInt(rawValue, 10).toLocaleString('en-US');
    setCostInput(formatted);
  };

  const handleSubmit = async () => {
    if (!mealName.trim()) {
      setError('Please enter a meal name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      let costValue: number | undefined = undefined;
      if (locationType === 'eat_out' && costInput) {
        costValue = parseInt(costInput.replace(/\D/g, ''), 10);
      }
      
      await mealService.logMeal(mealName.trim(), locationType, costValue);
      
      setSuccess(true);
      if (onMealLogged) {
        onMealLogged();
      }
      setTimeout(() => {
        setSuccess(false);
        setMealName('');
        setCostInput('');
        setLocationType('eat_home');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log meal';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Header>
        <UtensilsCrossed size={20} />
        Log a Meal
      </Header>

      <InputGroup>
        <Label>Meal Name</Label>
        <StyledInput 
          type="text" 
          placeholder="e.g. Breakfast, Phở, Sushi..." 
          value={mealName}
          onChange={(e) => {
            setMealName(e.target.value);
            if (error) setError(null);
          }}
        />
      </InputGroup>

      <ButtonGroup>
        <OptionButton 
          $active={locationType === 'eat_home'} 
          $type="eat_home"
          onClick={() => {
            setLocationType('eat_home');
            setCostInput('');
          }}
        >
          <Home size={24} />
          Eat at Home
        </OptionButton>
        <OptionButton 
          $active={locationType === 'eat_out'} 
          $type="eat_out"
          onClick={() => setLocationType('eat_out')}
        >
          <UtensilsCrossed size={24} />
          Eat Out
        </OptionButton>
      </ButtonGroup>

      {locationType === 'eat_out' && (
        <InputGroup>
          <Label>Cost</Label>
          <InputWrapper>
            <StyledInput 
              type="text" 
              inputMode="numeric"
              placeholder="e.g. 150,000" 
              value={costInput}
              onChange={handleCostChange}
            />
            <CurrencySymbol>VND</CurrencySymbol>
          </InputWrapper>
        </InputGroup>
      )}

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {success ? (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          Meal logged successfully!
        </SuccessMessage>
      ) : (
        <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Save Meal
            </>
          )}
        </SubmitButton>
      )}
    </Card>
  );
}
