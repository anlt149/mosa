import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, MainContent, Card, CardTitle } from '../components/common';
import { Plus, Trash2, ChevronLeft, ChevronRight, Flame, Check } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Styled Components ─────────────────────────────────────── */
const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.4s ease-out;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: normal;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  margin: 0;

  span {
    color: #10b981;
    font-weight: bold;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  background: #0b0b0b;
  border: 1px solid #222;
  border-radius: 4px;
  padding: 0.25rem;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #fff;
  }
`;

const MonthLabel = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 1rem;
  min-width: 120px;
  text-align: center;
`;

const AddHabitButton = styled.button`
  background: #fff;
  color: #000;
  border: 1px solid #fff;
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #000;
    color: #fff;
  }
`;

const HabitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const HabitCard = styled(Card)<{ $color: string }>`
  border: 1px solid #1f1f1f;
  transition: border-color 0.3s ease, transform 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;

  &:hover {
    border-color: ${props => props.$color}40;
    transform: translateY(-2px);
  }
`;

const HabitCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #1f1f1f;
  padding-bottom: 1rem;
`;

const HabitTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const HabitColorIndicator = styled.div<{ $color: string }>`
  width: 24px;
  height: 4px;
  background-color: ${props => props.$color};
  border-radius: 2px;
`;

const HabitCardName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #f43f5e;
  }
`;

/* ── Calendar Grid ── */
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.65rem;
  color: #555;
  text-transform: uppercase;
  font-weight: bold;
  padding-bottom: 0.25rem;
`;

const DaySquare = styled.button<{ $ticked: boolean; $color: string; $isPlaceholder: boolean; $isToday: boolean }>`
  aspect-ratio: 1;
  width: 100%;
  border-radius: 4px;
  background-color: ${props => {
    if (props.$isPlaceholder) return 'transparent';
    return props.$ticked ? props.$color : '#111';
  }};
  border: ${props => {
    if (props.$isPlaceholder) return 'none';
    if (props.$isToday) return `1.5px solid ${props.$color}`;
    return '1px solid #1f1f1f';
  }};
  color: ${props => (props.$ticked ? '#000' : '#888')};
  font-size: 0.7rem;
  font-weight: ${props => (props.$ticked || props.$isToday ? 'bold' : 'normal')};
  cursor: ${props => (props.$isPlaceholder ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;

  &:hover {
    ${props => !props.$isPlaceholder && `
      background-color: ${props.$ticked ? `${props.$color}dd` : '#1c1c1c'};
      transform: scale(1.05);
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
  border-top: 1px solid #1f1f1f;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
  font-size: 0.75rem;

  span {
    color: #fff;
    font-weight: bold;
  }
`;

/* ── Form Modal/Dropdown ── */
const AddFormContainer = styled(Card)`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid #222;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 500px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
`;

const Input = styled.input`
  background: #000;
  border: 1px solid #222;
  color: #fff;
  padding: 0.6rem 0.8rem;
  font-family: inherit;
  font-size: 0.85rem;
  border-radius: 4px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #555;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
`;

const ColorBubble = styled.button<{ $color: string; $selected: boolean }>`
  aspect-ratio: 1;
  width: 100%;
  background: ${props => props.$color};
  border: ${props => props.$selected ? '2px solid #fff' : '2px solid transparent'};
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.1);
  }
`;

const SubmitButton = styled.button`
  background: #fff;
  color: #000;
  border: 1px solid #fff;
  padding: 0.6rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #000;
    color: #fff;
  }

  &:disabled {
    background: #111;
    color: #444;
    border-color: #222;
    cursor: not-allowed;
  }
`;

/* ── Types ── */
interface Habit {
  id: string;
  name: string;
  color: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
}

const PRESET_COLORS = [
  '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', 
  '#f43f5e', '#f97316', '#eab308', '#14b8a6',
];

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Add habit fields
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Global Calendar Month State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (habitsData) setHabits(habitsData);

    // Fetch logs (last 180 days to populate current/adjacent months)
    const startRange = new Date();
    startRange.setDate(startRange.getDate() - 180);
    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('id, habit_id, log_date')
      .gte('log_date', startRange.toISOString().split('T')[0]);

    if (logsData) setLogs(logsData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('habits')
        .insert({ user_id: user.id, name: name.trim(), color })
        .select();
      
      if (!error && data) {
        setHabits([...habits, data[0]]);
        setName('');
        setShowForm(false);
      }
    }
    setSaving(false);
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit and all its history?')) return;
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) {
      setHabits(habits.filter(h => h.id !== id));
      setLogs(logs.filter(l => l.habit_id !== id));
    }
  };

  const handleToggleLog = async (habitId: string, dateStr: string) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);

    if (existingLog) {
      setLogs(prev => prev.filter(l => l.id !== existingLog.id));
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      if (error) fetchData(); // rollback
    } else {
      const tempId = crypto.randomUUID();
      const newLog = { id: tempId, habit_id: habitId, log_date: dateStr };
      setLogs(prev => [...prev, newLog]);
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, log_date: dateStr })
        .select();
      
      if (error) {
        fetchData(); // rollback
      } else if (data) {
        setLogs(prev => prev.map(l => l.id === tempId ? data[0] : l));
      }
    }
  };

  // Build calendar matrix info for the selected month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const result = [];
    // Placeholders
    for (let i = 0; i < firstDayIndex; i++) {
      result.push({ isPlaceholder: true, dateStr: '', dayNum: 0 });
    }
    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      result.push({ isPlaceholder: false, dateStr, dayNum: i });
    }
    return result;
  }, [currentMonth]);

  // Index logs by habit_id and log_date for O(1) checks
  const tickedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    logs.forEach(l => {
      map[`${l.habit_id}_${l.log_date}`] = true;
    });
    return map;
  }, [logs]);

  // Helper stats computation
  const getHabitStats = useCallback((habitId: string) => {
    // 1. Completion Rate for the current visible month
    const activeDays = calendarDays.filter(d => !d.isPlaceholder);
    const completedInMonth = activeDays.filter(d => tickedMap[`${habitId}_${d.dateStr}`]).length;
    const rate = activeDays.length ? Math.round((completedInMonth / activeDays.length) * 100) : 0;

    // 2. Current streak (consecutive days leading backwards from today/yesterday)
    let currentStreak = 0;
    const checkDate = new Date();
    
    // Start checking from today, go backwards
    for (let i = 0; i < 90; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (tickedMap[`${habitId}_${dStr}`]) {
        currentStreak++;
      } else {
        // If they missed today, they can still continue yesterday's streak
        if (i === 0) {
          const yesterday = new Date(checkDate);
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().split('T')[0];
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
    <Container>
      <MainContent>
        <DashboardHeader>
          <HeaderTitle>
            Habit <span>Tracker</span>
          </HeaderTitle>

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
              <AddHabitButton onClick={() => setShowForm(true)}>
                <Plus size={16} /> Add Habit
              </AddHabitButton>
            )}
          </ControlsRow>
        </DashboardHeader>

        {showForm && (
          <AddFormContainer>
            <CardTitle style={{ borderBottom: '1px solid #1f1f1f', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              Create New Habit
            </CardTitle>
            <Form onSubmit={handleCreateHabit}>
              <FormGroup>
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  type="text"
                  placeholder="e.g. Meditate, Run 5k, Study Spanish"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Choose Theme Color</Label>
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
                <SubmitButton type="submit" disabled={saving || !name.trim()} style={{ width: '120px' }}>
                  Save
                </SubmitButton>
                <SubmitButton
                  type="button"
                  style={{ width: '120px', background: 'transparent', color: '#888', borderColor: '#222' }}
                  onClick={() => { setShowForm(false); setName(''); }}
                >
                  Cancel
                </SubmitButton>
              </div>
            </Form>
          </AddFormContainer>
        )}

        {habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666', border: '1px dashed #222' }}>
            No habits created yet. Click "Add Habit" above to get started!
          </div>
        ) : (
          <HabitsGrid>
            {habits.map(h => {
              const stats = getHabitStats(h.id);
              return (
                <HabitCard key={h.id} $color={h.color}>
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
                      {weekDays.map(day => (
                        <WeekdayLabel key={day}>{day[0]}</WeekdayLabel>
                      ))}

                      {calendarDays.map((day, idx) => {
                        const ticked = tickedMap[`${h.id}_${day.dateStr}`];
                        const isToday = day.dateStr === todayStr;

                        return (
                          <DaySquare
                            key={idx}
                            $ticked={ticked}
                            $color={h.color}
                            $isPlaceholder={day.isPlaceholder}
                            $isToday={isToday}
                            onClick={() => !day.isPlaceholder && handleToggleLog(h.id, day.dateStr)}
                            disabled={day.isPlaceholder}
                            aria-label={day.isPlaceholder ? undefined : `${day.dateStr} - ${ticked ? 'Completed' : 'Not completed'}`}
                          >
                            {!day.isPlaceholder && (
                              ticked ? <Check size={12} /> : day.dayNum
                            )}
                          </DaySquare>
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
                      <Flame size={14} style={{ color: stats.streak > 0 ? '#f97316' : '#555' }} />
                      Streak: <span>{stats.streak}d</span>
                    </StatItem>
                  </StatsRow>
                </HabitCard>
              );
            })}
          </HabitsGrid>
        )}
      </MainContent>
    </Container>
  );
}
