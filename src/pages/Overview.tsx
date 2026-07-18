import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, CheckCircle2, Receipt, ChevronRight, TrendingUp } from 'lucide-react';
import { moodService } from '../services/moodService';
import { habitService } from '../services/habitService';
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
const getMonthRange = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${lastDay}`
  };
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



  const monthRange = getMonthRange();
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', monthRange.start, monthRange.end],
    queryFn: () => expenseService.getExpensesByDateRange(monthRange.start, monthRange.end)
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense_categories'],
    queryFn: expenseService.getCategories
  });

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);



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
    const completedToday = habits.filter(h => 
      habitLogs.some(l => l.habit_id === h.id && l.log_date === todayStr)
    ).length;
    return { completed: completedToday, total: habits.length };
  }, [habits, habitLogs, todayStr]);



  // Expenses
  const expenseStats = useMemo(() => {
    let planned = categories.reduce((sum, cat) => sum + cat.monthly_budget, 0);
    let spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { planned, spent, percent: planned > 0 ? (spent / planned) * 100 : 0 };
  }, [categories, expenses]);

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



        {/* Expenses Card */}
        <SummaryCard $color="#3b82f6" onClick={() => navigate('/expenses')}>
          <CardHeader>
            <CardIconWrapper $color="#3b82f6"><Receipt size={24} /></CardIconWrapper>
            <ChevronRight size={20} color="#52525b" className="arrow-icon" style={{ transition: 'all 0.2s' }} />
          </CardHeader>
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }}>Expenses</CardTitle>
            <CardValue style={{ fontSize: '2rem' }}>{formatter.format(expenseStats.spent)} <span style={{ fontSize: '1.25rem', color: '#52525b' }}>/ {formatter.format(expenseStats.planned)} ₫</span></CardValue>
            <CardSubtext>spent this month</CardSubtext>
            <ProgressBar>
              <ProgressFill $color={expenseStats.percent > 100 ? '#ef4444' : '#3b82f6'} $percent={expenseStats.percent} />
            </ProgressBar>
          </div>
        </SummaryCard>
      </Grid>
    </PageContainer>
  );
}
