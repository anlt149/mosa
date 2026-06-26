import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, CheckCircle2, UtensilsCrossed, Receipt, ChevronRight, TrendingUp } from 'lucide-react';
import { moodService } from '../services/moodService';
import { habitService } from '../services/habitService';
import { mealService } from '../services/mealService';
import { expenseService } from '../services/expenseService';

/* ── Animations & Layout ── */
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
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;

  span {
    background: linear-gradient(90deg, #10b981, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

/* ── Premium Cards ── */
const SummaryCard = styled.div<{ $color: string }>`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.75rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${({ $color }) => $color}, transparent);
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  /* Radial gradient glow on hover */
  &::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, ${({ $color }) => $color} 0%, transparent 70%);
    opacity: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
    pointer-events: none;
    z-index: 0;
    mix-blend-mode: screen;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: #3f3f46;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);

    &::before {
      opacity: 0.8;
    }
    
    &::after {
      opacity: 0.05;
    }

    .arrow-icon {
      transform: translateX(4px);
      color: ${({ $color }) => $color};
    }
  }

  * {
    z-index: 1;
    position: relative;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const CardIconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
`;

const CardValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
`;

const CardSubtext = styled.div`
  font-size: 0.9rem;
  color: #a1a1aa;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #27272a;
  border-radius: 3px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(Math.max($percent, 0), 100)}%;
  background: ${({ $color }) => $color};
  transition: width 1s ease;
`;

// Helper
const getMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function Overview() {
  const navigate = useNavigate();

  // ── Queries ──
  const { data: moodLogs = [] } = useQuery({
    queryKey: ['daily_logs'],
    queryFn: () => moodService.getRecentLogs(7)
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: habitService.getHabits
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ['habit_logs'],
    queryFn: () => habitService.getHabitLogs(30)
  });

  const { data: allMeals = [] } = useQuery({
    queryKey: ['all_meals'],
    queryFn: mealService.getAllMeals
  });

  const { data: userSettings } = useQuery({
    queryKey: ['user_settings'],
    queryFn: mealService.getUserSettings
  });

  const { data: fixedCosts = [] } = useQuery({
    queryKey: ['fixed_costs'],
    queryFn: expenseService.getFixedCosts
  });

  const currentMonthKey = getMonthKey();
  const { data: costRecords = [] } = useQuery({
    queryKey: ['cost_records', currentMonthKey],
    queryFn: () => expenseService.getCostRecords(currentMonthKey)
  });

  // ── Computations ──
  
  // Mood
  const moodStats = useMemo(() => {
    if (moodLogs.length === 0) return { avg: 0, text: 'No logs this week' };
    const sum = moodLogs.reduce((acc, log) => acc + log.mood_score, 0);
    const avg = (sum / moodLogs.length).toFixed(1);
    const todayLog = moodLogs.find(l => l.log_date === new Date().toISOString().split('T')[0]);
    return {
      avg,
      text: todayLog ? `Today's mood is ${todayLog.mood_score}/10` : 'Average this week'
    };
  }, [moodLogs]);

  // Habits
  const habitStats = useMemo(() => {
    if (habits.length === 0) return { completed: 0, total: 0 };
    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => 
      habitLogs.some(l => l.habit_id === h.id && l.log_date === todayStr)
    ).length;
    return { completed: completedToday, total: habits.length };
  }, [habits, habitLogs]);

  // Meals
  const mealStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let monthSpent = 0;
    
    allMeals.forEach(meal => {
      if (meal.cost_vnd) {
        const mealDate = new Date(meal.created_at);
        if (mealDate >= startOfMonth) monthSpent += meal.cost_vnd;
      }
    });

    const budget = userSettings?.monthly_food_budget_vnd || 0;
    const percent = budget > 0 ? (monthSpent / budget) * 100 : 0;
    
    return { spent: monthSpent, budget, percent };
  }, [allMeals, userSettings]);

  // Bills
  const billStats = useMemo(() => {
    let planned = 0, paid = 0;
    fixedCosts.forEach(fc => {
      planned += fc.default_amount || 0;
      const record = costRecords.find(r => r.fixed_cost_id === fc.id);
      const actualVal = record?.actual_amount ?? fc.default_amount ?? 0;
      if (record?.is_paid) paid += actualVal;
    });
    return { planned, paid, percent: planned > 0 ? (paid / planned) * 100 : 0 };
  }, [fixedCosts, costRecords]);

  const formatter = new Intl.NumberFormat('en-US');

  return (
    <PageContainer>
      <Header>
        <Title>Welcome to <span>Mosa</span></Title>
      </Header>

      <Grid>
        {/* Mood Card */}
        <SummaryCard $color="#10b981" onClick={() => navigate('/mood')}>
          <CardHeader>
            <CardIconWrapper $color="#10b981"><HeartPulse size={24} /></CardIconWrapper>
            <ChevronRight size={20} color="#52525b" className="arrow-icon" style={{ transition: 'all 0.2s' }} />
          </CardHeader>
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }}>Mood & Energy</CardTitle>
            <CardValue>{moodStats.avg} <span style={{ fontSize: '1.25rem', color: '#52525b' }}>/10</span></CardValue>
            <CardSubtext>
              <TrendingUp size={14} />
              {moodStats.text}
            </CardSubtext>
          </div>
        </SummaryCard>

        {/* Habits Card */}
        <SummaryCard $color="#8b5cf6" onClick={() => navigate('/habits')}>
          <CardHeader>
            <CardIconWrapper $color="#8b5cf6"><CheckCircle2 size={24} /></CardIconWrapper>
            <ChevronRight size={20} color="#52525b" className="arrow-icon" style={{ transition: 'all 0.2s' }} />
          </CardHeader>
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }}>Daily Habits</CardTitle>
            <CardValue>{habitStats.completed} <span style={{ fontSize: '1.25rem', color: '#52525b' }}>/ {habitStats.total}</span></CardValue>
            <CardSubtext>completed today</CardSubtext>
            <ProgressBar>
              <ProgressFill 
                $color="#8b5cf6" 
                $percent={habitStats.total > 0 ? (habitStats.completed / habitStats.total) * 100 : 0} 
              />
            </ProgressBar>
          </div>
        </SummaryCard>

        {/* Meals Card */}
        <SummaryCard $color="#f97316" onClick={() => navigate('/meals')}>
          <CardHeader>
            <CardIconWrapper $color="#f97316"><UtensilsCrossed size={24} /></CardIconWrapper>
            <ChevronRight size={20} color="#52525b" className="arrow-icon" style={{ transition: 'all 0.2s' }} />
          </CardHeader>
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }}>Food Budget</CardTitle>
            <CardValue style={{ fontSize: '2rem' }}>{formatter.format(mealStats.spent)} <span style={{ fontSize: '1.25rem', color: '#52525b' }}>₫</span></CardValue>
            <CardSubtext>spent this month</CardSubtext>
            <ProgressBar>
              <ProgressFill 
                $color={mealStats.percent > 90 ? '#ef4444' : '#f97316'} 
                $percent={mealStats.percent} 
              />
            </ProgressBar>
          </div>
        </SummaryCard>

        {/* Bills Card */}
        <SummaryCard $color="#3b82f6" onClick={() => navigate('/bills')}>
          <CardHeader>
            <CardIconWrapper $color="#3b82f6"><Receipt size={24} /></CardIconWrapper>
            <ChevronRight size={20} color="#52525b" className="arrow-icon" style={{ transition: 'all 0.2s' }} />
          </CardHeader>
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }}>Fixed Costs</CardTitle>
            <CardValue style={{ fontSize: '2rem' }}>{formatter.format(billStats.paid)} <span style={{ fontSize: '1.25rem', color: '#52525b' }}>/ {formatter.format(billStats.planned)} ₫</span></CardValue>
            <CardSubtext>paid this month</CardSubtext>
            <ProgressBar>
              <ProgressFill $color="#3b82f6" $percent={billStats.percent} />
            </ProgressBar>
          </div>
        </SummaryCard>
      </Grid>
    </PageContainer>
  );
}
