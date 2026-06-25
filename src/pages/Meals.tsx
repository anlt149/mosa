import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MealTracker } from '../components/MealTracker';
import { MealHeatmap } from '../components/MealHeatmap';
import { mealService, type Meal } from '../services/mealService';

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
`;

const HistoryDate = styled.span`
  color: #a1a1aa;
  font-size: 0.85rem;
`;

const HistoryCost = styled.span`
  color: #f97316;
  font-weight: 600;
  font-size: 1.1rem;
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

import { Home, UtensilsCrossed, TrendingUp, CalendarDays } from 'lucide-react';

export function Meals() {
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchMeals = async () => {
    try {
      const [recent, all] = await Promise.all([
        mealService.getRecentMeals(),
        mealService.getAllMeals()
      ]);
      setRecentMeals(recent);
      setAllMeals(all);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleMealLogged = () => {
    fetchMeals(); // Refresh data when new meal is added
  };

  // Calculate summaries
  const now = new Date();
  
  // Start of current week (assuming Monday start)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7; // 1-7 where 1 is Monday
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekSpent = 0;
  let monthSpent = 0;

  allMeals.forEach(meal => {
    if (meal.location_type === 'eat_out' && meal.cost_vnd) {
      const mealDate = new Date(meal.created_at);
      if (mealDate >= startOfMonth) {
        monthSpent += meal.cost_vnd;
      }
      if (mealDate >= startOfWeek) {
        weekSpent += meal.cost_vnd;
      }
    }
  });

  return (
    <PageContainer>
      <Header>
        <Title>
          Meal <span>Tracker</span>
        </Title>
      </Header>

      <SummaryBanner>
        <SummaryStat>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa' }}>
            <TrendingUp size={16} />
            <h3>Spent This Week</h3>
          </div>
          <p>{weekSpent.toLocaleString('en-US')} ₫</p>
        </SummaryStat>
        <SummaryStat>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa' }}>
            <CalendarDays size={16} />
            <h3>Spent This Month</h3>
          </div>
          <p>{monthSpent.toLocaleString('en-US')} ₫</p>
        </SummaryStat>
      </SummaryBanner>

      <DashboardGrid>
        <Column>
          <MealTracker onMealLogged={handleMealLogged} />
          
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
            <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
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
                      </HistoryType>
                      <HistoryDate>
                        {meal.location_type === 'eat_out' ? 'Eat Out' : 'Eat at Home'} &bull; {new Date(meal.created_at).toLocaleString()}
                      </HistoryDate>
                    </HistoryContent>
                    {meal.location_type === 'eat_out' && meal.cost_vnd != null && (
                      <HistoryCost>{meal.cost_vnd.toLocaleString('en-US')} ₫</HistoryCost>
                    )}
                  </HistoryItem>
                ))}
              </HistoryList>
            )}
          </Card>
        </Column>
      </DashboardGrid>
    </PageContainer>
  );
}
