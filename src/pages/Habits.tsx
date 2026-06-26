import { useState, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { habitService } from '../services/habitService';
import { Plus, Trash2, ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Identical Layout to Dashboard ─────────────────────────── */
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
  flex-wrap: wrap;
  gap: 1rem;
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

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  /* Subtle inner glow for premium feel */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }
`;

const ActionButton = styled.button`
  background: #18181b;
  color: #a1a1aa;
  border: 1px solid #27272a;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #27272a;
    color: #fff;
    border-color: #3f3f46;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #10b981;
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 1.25rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: #34d399;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    background: #27272a;
    color: #52525b;
    cursor: not-allowed;
  }
`;

/* ── Habit Specific Styling ───────────────────────────────── */
const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 0.25rem;
`;

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: #27272a;
  }
`;

const MonthLabel = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 1rem;
  min-width: 130px;
  text-align: center;
`;

const HabitCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #27272a;
  padding-bottom: 1rem;
`;

const HabitTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const HabitColorIndicator = styled.div<{ $color: string }>`
  width: 24px;
  height: 4px;
  background-color: ${props => props.$color};
  border-radius: 2px;
  box-shadow: 0 0 8px ${props => props.$color}40;
`;

const HabitCardName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #52525b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #ef4444;
  }
`;

/* ── Calendar Grid (Matching Heatmap Aesthetic) ── */
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const WeekdayLabelRow = styled.div`
  display: contents;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #52525b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const DayCellContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  position: relative;
`;

const DaySquare = styled.button<{ $ticked: boolean; $color: string; $isPlaceholder: boolean; $isToday: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${props => {
    if (props.$isPlaceholder) return 'transparent';
    return props.$ticked ? props.$color : '#18181b';
  }};
  border: ${props => {
    if (props.$isPlaceholder) return 'none';
    if (props.$ticked) return `1px solid transparent`;
    if (props.$isToday) return `1px solid ${props.$color}`;
    return '1px solid transparent';
  }};
  box-shadow: ${props => {
    if (props.$isPlaceholder || !props.$ticked) return 'none';
    return 'inset 0 1px 1px rgba(255,255,255,0.2)';
  }};
  color: ${props => (props.$ticked ? '#000' : '#71717a')};
  font-size: 0.85rem;
  font-weight: ${props => (props.$ticked || props.$isToday ? 'bold' : 'normal')};
  cursor: ${props => (props.$isPlaceholder ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    ${props => !props.$isPlaceholder && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${props.$color}40;
      border-color: ${props.$ticked ? '#fff' : props.$color};
    `}
  }

  &:disabled {
    cursor: default;
  }
`;

/* ── Habit Stats ── */
const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #27272a;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a1a1aa;
  font-size: 0.8rem;
  font-weight: 500;

  span {
    color: #fff;
    font-weight: 600;
  }
`;

/* ── Form Modal/Dropdown ── */
const AddFormContainer = styled(Card)`
  margin-bottom: 2rem;
  border: 1px solid #3f3f46;
  max-width: 500px;
`;

const FormTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  border-bottom: 1px solid #27272a;
  padding-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #a1a1aa;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const Input = styled.input`
  background: #18181b;
  border: 1px solid #3f3f46;
  color: #fff;
  padding: 0.85rem;
  font-family: inherit;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 1px #10b981;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.75rem;
`;

const ColorBubble = styled.button<{ $color: string; $selected: boolean }>`
  aspect-ratio: 1;
  width: 100%;
  background: ${props => props.$color};
  border: ${props => props.$selected ? '2px solid #fff' : '2px solid transparent'};
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.15);
  }
`;

const PRESET_COLORS = [
  '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', 
  '#f43f5e', '#f97316', '#eab308', '#14b8a6',
];

export function Habits() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const queryClient = useQueryClient();

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => habitService.getHabits()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['habit_logs'],
    queryFn: () => habitService.getHabitLogs(180)
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const createMutation = useMutation({
    mutationFn: (variables: { name: string, color: string }) => habitService.createHabit(variables.name, variables.color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setName('');
      toast.success('Habit created.');
    },
    onError: () => toast.error('Failed to create habit.')
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), color });
  };

  const deleteMutation = useMutation({
    mutationFn: habitService.deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habit_logs'] });
      toast.success('Habit deleted.');
    },
    onError: () => toast.error('Failed to delete habit.')
  });

  const handleDeleteHabit = (id: string) => {
    if (!confirm('Are you sure you want to delete this habit and all its history?')) return;
    deleteMutation.mutate(id);
  };

  const toggleMutation = useMutation({
    mutationFn: (variables: { habitId: string, dateStr: string, existingLogId?: string }) => 
      habitService.toggleHabitLog(variables.habitId, variables.dateStr, variables.existingLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit_logs'] });
    }
  });

  const handleToggleLog = (habitId: string, dateStr: string) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);
    toggleMutation.mutate({ habitId, dateStr, existingLogId: existingLog?.id });
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result = [];
    for (let i = 0; i < firstDayIndex; i++) {
      result.push({ isPlaceholder: true, dateStr: '', dayNum: 0 });
    }
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      result.push({ isPlaceholder: false, dateStr, dayNum: i });
    }
    return result;
  }, [currentMonth]);

  const tickedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    logs.forEach(l => {
      map[`${l.habit_id}_${l.log_date}`] = true;
    });
    return map;
  }, [logs]);

  const getHabitStats = useCallback((habitId: string) => {
    const activeDays = calendarDays.filter(d => !d.isPlaceholder);
    const completedInMonth = activeDays.filter(d => tickedMap[`${habitId}_${d.dateStr}`]).length;
    const rate = activeDays.length ? Math.round((completedInMonth / activeDays.length) * 100) : 0;

    let currentStreak = 0;
    const checkDate = new Date();
    
    for (let i = 0; i < 90; i++) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (tickedMap[`${habitId}_${dStr}`]) {
        currentStreak++;
      } else {
        if (i === 0) {
          const yesterday = new Date(checkDate);
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
          if (tickedMap[`${habitId}_${yStr}`]) {
            checkDate.setDate(checkDate.getDate() - 1);
            currentStreak++;
            continue;
          }
        }
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { completedInMonth, totalInMonth: activeDays.length, rate, streak: currentStreak };
  }, [calendarDays, tickedMap]);

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <PageContainer>
      <Header>
        <Title>Habit <span>Tracker</span></Title>
        <ControlsRow>
          <MonthSelector>
            <NavButton onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </NavButton>
            <MonthLabel>{monthLabel}</MonthLabel>
            <NavButton onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </NavButton>
          </MonthSelector>

          {!showForm && (
            <ActionButton onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Habit
            </ActionButton>
          )}
        </ControlsRow>
      </Header>

      {showForm && (
        <AddFormContainer>
          <FormTitle>Create New Habit</FormTitle>
          <Form onSubmit={handleCreateHabit}>
            <FormGroup>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                type="text"
                placeholder="e.g. Meditate, Run 5k"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={50}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Theme Color</Label>
              <ColorGrid>
                {PRESET_COLORS.map(c => (
                  <ColorBubble
                    key={c}
                    type="button"
                    $color={c}
                    $selected={color === c}
                    onClick={() => setColor(c)}
                  />
                ))}
              </ColorGrid>
            </FormGroup>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <SubmitButton type="submit" disabled={createMutation.isPending || !name.trim()} style={{ width: '120px', margin: 0, padding: '0.85rem' }}>
                Save
              </SubmitButton>
              <SubmitButton
                type="button"
                style={{ width: '120px', margin: 0, padding: '0.85rem', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46' }}
                onClick={() => { setShowForm(false); setName(''); }}
              >
                Cancel
              </SubmitButton>
            </div>
          </Form>
        </AddFormContainer>
      )}

      {habits.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem', color: '#a1a1aa', borderStyle: 'dashed' }}>
          No habits created yet. Click "Add Habit" above to get started!
        </Card>
      ) : (
        <DashboardGrid>
          {habits.map(h => {
            const stats = getHabitStats(h.id);
            return (
              <Card key={h.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <HabitCardHeader>
                    <HabitTitleContainer>
                      <HabitColorIndicator $color={h.color} />
                      <HabitCardName>{h.name}</HabitCardName>
                    </HabitTitleContainer>
                    <DeleteButton onClick={() => handleDeleteHabit(h.id)} aria-label={`Delete ${h.name}`}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </HabitCardHeader>

                  <CalendarGrid style={{ marginTop: '1.25rem' }}>
                    <WeekdayLabelRow>
                      {weekDays.map(day => (
                        <WeekdayLabel key={day}>{day[0]}</WeekdayLabel>
                      ))}
                    </WeekdayLabelRow>

                    {calendarDays.map((day, idx) => {
                      const ticked = tickedMap[`${h.id}_${day.dateStr}`];
                      const isToday = day.dateStr === todayStr;

                      return (
                        <DayCellContainer key={idx}>
                          <DaySquare
                            $ticked={ticked}
                            $color={h.color}
                            $isPlaceholder={day.isPlaceholder}
                            $isToday={isToday}
                            onClick={() => !day.isPlaceholder && handleToggleLog(h.id, day.dateStr)}
                            disabled={day.isPlaceholder}
                          >
                            {!day.isPlaceholder && (
                              ticked ? <Check size={12} strokeWidth={3} /> : day.dayNum
                            )}
                          </DaySquare>
                        </DayCellContainer>
                      );
                    })}
                  </CalendarGrid>
                </div>

                <StatsRow>
                  <StatItem>
                    <Check size={14} style={{ color: h.color }} />
                    Month: <span>{stats.rate}%</span> ({stats.completedInMonth}/{stats.totalInMonth})
                  </StatItem>
                  <StatItem>
                    <Flame size={14} style={{ color: stats.streak > 0 ? '#f97316' : '#52525b' }} />
                    Streak: <span>{stats.streak}d</span>
                  </StatItem>
                </StatsRow>
              </Card>
            );
          })}
        </DashboardGrid>
      )}
    </PageContainer>
  );
}
