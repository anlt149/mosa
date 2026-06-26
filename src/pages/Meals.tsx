import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MealTracker } from '../components/MealTracker';
import { MealHeatmap } from '../components/MealHeatmap';
import { MealAnalytics } from '../components/MealAnalytics';
import { mealService, type Meal } from '../services/mealService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Home, UtensilsCrossed, TrendingUp, CalendarDays, Settings, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;

  span {
    color: #10b981;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
`;

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

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled.div`
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;

  &:hover .actions {
    opacity: 1;
  }
`;

const HistoryIconWrapper = styled.div<{ $type: 'eat_out' | 'eat_home' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $type }) => $type === 'eat_home' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)'};
  color: ${({ $type }) => $type === 'eat_home' ? '#10b981' : '#f97316'};
`;

const HistoryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const HistoryType = styled.span`
  color: #fff;
  font-weight: 600;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TagBadge = styled.span`
  background: #27272a;
  color: #a1a1aa;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: normal;
`;

const HistoryDate = styled.span`
  color: #a1a1aa;
  font-size: 0.85rem;
`;

const HistoryCost = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const ActionBtn = styled.button`
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: #fff;
    background: #27272a;
  }
`;

const SummaryBanner = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SummaryStat = styled.div`
  flex: 1;
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.2), transparent);
  }
  
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h3 {
    margin: 0;
    color: #a1a1aa;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  p {
    margin: 0;
    color: #f97316;
    font-size: 1.75rem;
    font-weight: 700;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #27272a;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  background: ${({ $percent }) => ($percent > 90 ? '#ef4444' : '#10b981')};
  width: ${({ $percent }) => Math.min($percent, 100)}%;
  transition: width 0.5s ease;
`;

const BudgetInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;

  input {
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 0.4rem 0.5rem;
    color: #fff;
    font-size: 0.9rem;
    width: 120px;
    outline: none;

    &:focus {
      border-color: #10b981;
    }
  }

  button {
    background: #10b981;
    border: none;
    border-radius: 6px;
    color: #000;
    padding: 0.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #059669;
    }
  }
`;

export function Meals() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const queryClient = useQueryClient();

  const { data: recentMeals = [] } = useQuery({
    queryKey: ['recent_meals'],
    queryFn: mealService.getRecentMeals
  });

  const { data: allMeals = [] } = useQuery({
    queryKey: ['all_meals'],
    queryFn: mealService.getAllMeals
  });

  const { data: userSettings } = useQuery({
    queryKey: ['user_settings'],
    queryFn: mealService.getUserSettings
  });

  useEffect(() => {
    if (userSettings?.monthly_food_budget_vnd && !isEditingBudget) {
      setBudgetInput(userSettings.monthly_food_budget_vnd.toString());
    }
  }, [userSettings, isEditingBudget]);

  const handleMealLogged = () => {
    setEditingMeal(null);
    queryClient.invalidateQueries({ queryKey: ['recent_meals'] });
    queryClient.invalidateQueries({ queryKey: ['all_meals'] });
    toast.success('Meal saved successfully.');
  };

  const deleteMutation = useMutation({
    mutationFn: mealService.deleteMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent_meals'] });
      queryClient.invalidateQueries({ queryKey: ['all_meals'] });
      toast.success('Meal deleted.');
    },
    onError: () => toast.error('Failed to delete meal.')
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      deleteMutation.mutate(id);
    }
  };

  const budgetMutation = useMutation({
    mutationFn: mealService.updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
      setIsEditingBudget(false);
      toast.success('Budget updated.');
    },
    onError: () => toast.error('Failed to update budget.')
  });

  const handleSaveBudget = () => {
    const val = budgetInput ? parseInt(budgetInput.replace(/\D/g, ''), 10) : null;
    budgetMutation.mutate(val);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setBudgetInput('');
      return;
    }
    setBudgetInput(parseInt(rawValue, 10).toLocaleString('en-US'));
  };

  // Calculate summaries (total food cost)
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7; 
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekSpent = 0;
  let monthSpent = 0;

  allMeals.forEach(meal => {
    if (meal.cost_vnd) {
      const mealDate = new Date(meal.created_at);
      if (mealDate >= startOfMonth) {
        monthSpent += meal.cost_vnd;
      }
      if (mealDate >= startOfWeek) {
        weekSpent += meal.cost_vnd;
      }
    }
  });

  const budget = userSettings?.monthly_food_budget_vnd;
  const budgetPercent = budget ? (monthSpent / budget) * 100 : 0;

  return (
    <PageContainer>
      <Header>
        <Title>
          Meal <span>Tracker</span>
        </Title>
      </Header>

      <div style={{ marginBottom: '2rem' }}>
        <MealTracker 
          onMealLogged={handleMealLogged} 
          initialMeal={editingMeal}
          onCancelEdit={() => setEditingMeal(null)}
        />
      </div>

      <SummaryBanner>
        <SummaryStat>
          <div className="header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa' }}>
              <TrendingUp size={16} />
              <h3>Total Spent This Week</h3>
            </div>
          </div>
          <p>{weekSpent.toLocaleString('en-US')} ₫</p>
        </SummaryStat>

        <SummaryStat>
          <div className="header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa' }}>
              <CalendarDays size={16} />
              <h3>Total Spent This Month</h3>
            </div>
            <ActionBtn onClick={() => setIsEditingBudget(!isEditingBudget)}>
              <Settings size={16} />
            </ActionBtn>
          </div>
          
          <p>{monthSpent.toLocaleString('en-US')} ₫</p>
          
          {isEditingBudget ? (
            <BudgetInputWrapper>
              <input 
                type="text" 
                value={budgetInput} 
                onChange={handleBudgetChange} 
                placeholder="Budget (VND)" 
              />
              <button onClick={handleSaveBudget}><CheckCircle2 size={16} /></button>
            </BudgetInputWrapper>
          ) : budget ? (
            <>
              <ProgressBarContainer>
                <ProgressBarFill $percent={budgetPercent} />
              </ProgressBarContainer>
              <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{budgetPercent.toFixed(1)}% used</span>
                <span>Budget: {budget.toLocaleString('en-US')} ₫</span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>
              Click the gear icon to set a monthly budget.
            </div>
          )}
        </SummaryStat>
      </SummaryBanner>

      <DashboardGrid>
        <Column>
          <Card>
            <MealHeatmap 
              meals={allMeals} 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
            />
          </Card>
        </Column>
        <Column>
          <Card>
            <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: 0 }}>
              {selectedDate ? `Meals on ${selectedDate}` : 'Recent Meals'}
            </h2>
            {recentMeals.length === 0 && !selectedDate ? (
              <p style={{ color: '#a1a1aa', textAlign: 'center' }}>No meals logged yet.</p>
            ) : (
              <HistoryList>
                {(selectedDate ? allMeals.filter(m => m.created_at.startsWith(selectedDate)) : recentMeals).map((meal) => (
                  <HistoryItem key={meal.id}>
                    <HistoryIconWrapper $type={meal.location_type}>
                      {meal.location_type === 'eat_home' ? <Home size={24} /> : <UtensilsCrossed size={24} />}
                    </HistoryIconWrapper>
                    <HistoryContent>
                      <HistoryType>
                        {meal.meal_name || (meal.location_type === 'eat_out' ? 'Ate Out' : 'Ate at Home')}
                        {meal.tags?.length > 0 && meal.tags.map(tag => (
                          <TagBadge key={tag}>{tag}</TagBadge>
                        ))}
                      </HistoryType>
                      <HistoryDate>
                        {meal.meal_type} &bull; {meal.location_type === 'eat_out' ? 'Eat Out' : 'Eat at Home'} &bull; {new Date(meal.created_at).toLocaleString()}
                      </HistoryDate>
                    </HistoryContent>
                    
                    {meal.cost_vnd != null && (
                      <HistoryCost style={{ color: meal.location_type === 'eat_out' ? '#f97316' : '#10b981' }}>
                        {meal.cost_vnd.toLocaleString('en-US')} ₫
                      </HistoryCost>
                    )}

                    <ActionButtons className="actions">
                      <ActionBtn onClick={() => setEditingMeal(meal)} title="Edit Meal">
                        <Edit2 size={16} />
                      </ActionBtn>
                      <ActionBtn onClick={() => handleDelete(meal.id)} title="Delete Meal">
                        <Trash2 size={16} />
                      </ActionBtn>
                    </ActionButtons>
                  </HistoryItem>
                ))}
              </HistoryList>
            )}
          </Card>

          <MealAnalytics meals={allMeals} />
        </Column>
      </DashboardGrid>
    </PageContainer>
  );
}
