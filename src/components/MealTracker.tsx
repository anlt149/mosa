import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Home, UtensilsCrossed, Loader2, CheckCircle2, X } from 'lucide-react';
import { mealService, type Meal } from '../services/mealService';

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
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  
  svg {
    color: #10b981;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  &:hover {
    color: #fff;
    background: #27272a;
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

const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const PillButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#27272a' : '#18181b')};
  border: 1px solid ${({ $active }) => ($active ? '#3f3f46' : '#27272a')};
  color: ${({ $active }) => ($active ? '#fff' : '#a1a1aa')};
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #27272a;
    color: #fff;
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
  padding: 0.875rem;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #10b981;
  }
  
  &::placeholder {
    color: #52525b;
  }
`;

const CostInput = styled(StyledInput)`
  padding-right: 3rem;
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

type MealTypeOption = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

interface MealTrackerProps {
  onMealLogged?: () => void;
  initialMeal?: Meal | null;
  onCancelEdit?: () => void;
}

export function MealTracker({ onMealLogged, initialMeal, onCancelEdit }: MealTrackerProps) {
  const [mealName, setMealName] = useState('');
  const [locationType, setLocationType] = useState<'eat_out' | 'eat_home'>('eat_home');
  const [mealType, setMealType] = useState<MealTypeOption>('Lunch');
  const [tagsInput, setTagsInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMeal) {
      setMealName(initialMeal.meal_name);
      setLocationType(initialMeal.location_type);
      setMealType(initialMeal.meal_type || 'Lunch');
      setTagsInput(initialMeal.tags?.join(', ') || '');
      setCostInput(initialMeal.cost_vnd ? initialMeal.cost_vnd.toLocaleString('en-US') : '');
    } else {
      setMealName('');
      setLocationType('eat_home');
      setMealType('Lunch');
      setTagsInput('');
      setCostInput('');
    }
  }, [initialMeal]);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setCostInput('');
      return;
    }
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
      if (costInput) {
        costValue = parseInt(costInput.replace(/\D/g, ''), 10);
      }

      const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      if (initialMeal) {
        await mealService.updateMeal(initialMeal.id, {
          meal_name: mealName.trim(),
          location_type: locationType,
          meal_type: mealType,
          tags: tagsArray,
          cost_vnd: costValue || null,
        });
      } else {
        await mealService.logMeal(mealName.trim(), locationType, mealType, tagsArray, costValue);
      }
      
      setSuccess(true);
      if (onMealLogged) {
        onMealLogged();
      }
      setTimeout(() => {
        setSuccess(false);
        if (!initialMeal) {
          setMealName('');
          setCostInput('');
          setTagsInput('');
          setLocationType('eat_home');
          setMealType('Lunch');
        } else if (onCancelEdit) {
          onCancelEdit();
        }
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
        <HeaderTitle>
          <UtensilsCrossed size={20} />
          {initialMeal ? 'Edit Meal' : 'Log a Meal'}
        </HeaderTitle>
        {initialMeal && onCancelEdit && (
          <CancelButton onClick={onCancelEdit}>
            <X size={20} />
          </CancelButton>
        )}
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
          onClick={() => setLocationType('eat_home')}
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

      <PillGroup>
        {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealTypeOption[]).map(type => (
          <PillButton 
            key={type} 
            $active={mealType === type}
            onClick={() => setMealType(type)}
          >
            {type}
          </PillButton>
        ))}
      </PillGroup>

      <InputGroup>
        <Label>Tags (optional)</Label>
        <StyledInput 
          type="text" 
          placeholder="e.g. Healthy, Spicy, Cheat Meal..." 
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <Label>Cost (optional)</Label>
        <InputWrapper>
          <CostInput 
            type="text" 
            inputMode="numeric"
            placeholder="e.g. 150,000" 
            value={costInput}
            onChange={handleCostChange}
          />
          <CurrencySymbol>VND</CurrencySymbol>
        </InputWrapper>
      </InputGroup>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {success ? (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          {initialMeal ? 'Meal updated successfully!' : 'Meal logged successfully!'}
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
              {initialMeal ? 'Save Changes' : 'Save Meal'}
            </>
          )}
        </SubmitButton>
      )}
    </Card>
  );
}
