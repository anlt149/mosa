import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, MainContent } from '../components/common';
import { Plus, ChevronLeft, ChevronRight, Check, Calendar, Activity, RefreshCw, Trash2 } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Styled Components ─────────────────────────────────────── */
const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
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

const ViewToggleContainer = styled.div`
  display: flex;
  background: #111;
  border: 1px solid #222;
  padding: 2px;
  margin-top: 0.5rem;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const ViewToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#222' : 'none'};
  border: none;
  color: ${props => props.$active ? '#fff' : '#888'};
  padding: 0.4rem 1rem;
  font-family: inherit;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 280px 1fr;
  }
`;

const Panel = styled.div`
  background: #0b0b0b;
  border: 1px solid #1a1a1a;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const PanelTitle = styled.h2`
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  margin: 0;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 0.75rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #555;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
`;

const ColorBubble = styled.button<{ $color: string; $selected: boolean }>`
  height: 32px;
  background: ${props => props.$color};
  border: ${props => props.$selected ? '2px solid #fff' : '2px solid transparent'};
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.05);
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

const HabitItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem;
  background: #000;
  border: 1px solid #111;
  border-left: 3px solid ${props => props.$color};
`;

const HabitInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const HabitName = styled.span`
  font-size: 0.85rem;
  color: #fff;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #f43f5e;
  }
`;

const CalendarControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0b0b0b;
  border: 1px solid #1a1a1a;
  padding: 0.75rem 1rem;
`;

const CalendarNavButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;

  &:hover {
    color: #fff;
  }
`;

const CalendarLabel = styled.span`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: #0b0b0b;
  border: 1px solid #1a1a1a;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const Th = styled.th<{ $isToday?: boolean }>`
  border-bottom: 1px solid #1a1a1a;
  border-right: 1px solid #111;
  padding: 0.5rem;
  font-size: 0.65rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.$isToday ? '#10b981' : '#666'};
  background: ${props => props.$isToday ? '#10b98108' : 'none'};
  text-align: center;
`;

const Td = styled.td`
  border-bottom: 1px solid #1a1a1a;
  border-right: 1px solid #111;
  padding: 0.4rem;
  text-align: center;
`;

const HabitRowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  text-align: left;
`;

const ColorIndicator = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  background: ${props => props.$color};
`;

const RowHabitName = styled.span`
  font-size: 0.8rem;
  color: #ccc;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 130px;
`;

const CheckSquare = styled.button<{ $color: string; $checked: boolean; $isToday?: boolean }>`
  width: 24px;
  height: 24px;
  background: ${props => props.$checked ? props.$color : 'transparent'};
  border: 1px solid ${props => props.$isToday ? '#10b981' : (props.$checked ? props.$color : '#222')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.$color};
    box-shadow: 0 0 8px ${props => props.$color}40;
  }
`;

const YearGridWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HabitYearCard = styled.div<{ $color: string }>`
  background: #0b0b0b;
  border: 1px solid #1a1a1a;
  padding: 1.25rem;
`;

const HabitYearHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const HabitYearTitle = styled.h3`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const YearStats = styled.span`
  font-size: 0.7rem;
  color: #666;
`;

const MonthsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const MonthBox = styled.div`
  background: #000;
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const MonthLabel = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #555;
  letter-spacing: 0.05em;
  font-weight: bold;
`;

const DaysPixelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const PixelCell = styled.div<{ $color: string; $checked: boolean; $isToday?: boolean }>`
  aspect-ratio: 1;
  background: ${props => props.$checked ? props.$color : '#0c0c0c'};
  border: 1px solid ${props => props.$isToday ? '#10b981' : 'transparent'};
  font-size: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.15);
    background: ${props => props.$checked ? props.$color : '#222'};
  }
`;

interface Habit {
  id: string;
  name: string;
  color: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
}

const PRESET_COLORS = [
  '#10b981', // Green
  '#0ea5e9', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#14b8a6', // Teal
];

export function Habits() {
  const [view, setView] = useState<'month' | 'year'>('month');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to format date in YYYY-MM-DD local format
  const getLocalDateString = useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const todayStr = useMemo(() => getLocalDateString(new Date()), [getLocalDateString]);

  // Fetch Habits and Logs
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;
      setHabits(habitsData || []);

      // 2. Fetch logs for current selected context (current month or current year)
      let startStr = '';
      let endStr = '';

      if (view === 'month') {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        startStr = getLocalDateString(startOfMonth);
        endStr = getLocalDateString(endOfMonth);
      } else {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        startStr = getLocalDateString(startOfYear);
        endStr = getLocalDateString(endOfYear);
      }

      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('id, habit_id, log_date')
        .gte('log_date', startStr)
        .lte('log_date', endStr);

      if (logsError) throw logsError;
      setLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching habits data:', err);
    } finally {
      setLoading(false);
    }
  }, [view, year, month, getLocalDateString]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      // Defer to microtask queue so loading state changes asynchronously
      await Promise.resolve();
      if (!ignore) {
        fetchData();
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  // Handle Habit Creation
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: name.trim(),
          color,
        })
        .select();

      if (error) throw error;

      if (data) {
        setHabits([...habits, data[0]]);
        setName('');
      }
    } catch (err) {
      console.error('Error creating habit:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle Habit Deletion
  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit and all its logged history?')) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHabits(habits.filter(h => h.id !== id));
      setLogs(logs.filter(l => l.habit_id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Toggle log (Check-in)
  const handleToggleLog = async (habitId: string, dateStr: string) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);

    if (existingLog) {
      // Optimistic Update
      setLogs(logs.filter(l => l.id !== existingLog.id));

      try {
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id);

        if (error) {
          // Rollback on error
          setLogs([...logs, existingLog]);
          throw error;
        }
      } catch (err) {
        console.error('Error deleting log:', err);
        fetchData(); // Reset
      }
    } else {
      const tempId = crypto.randomUUID();
      const newLog = { id: tempId, habit_id: habitId, log_date: dateStr };
      // Optimistic Update
      setLogs([...logs, newLog]);

      try {
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            log_date: dateStr,
          })
          .select();

        if (error) throw error;
        if (data) {
          // Replace temp log with actual DB log
          setLogs(prev => prev.map(l => l.id === tempId ? data[0] : l));
        }
      } catch (err) {
        console.error('Error creating log:', err);
        // Rollback
        setLogs(prev => prev.filter(l => l.id !== tempId));
        fetchData(); // Reset
      }
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Year navigation helpers
  const handlePrevYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };

  // Generate days array for the selected month
  const monthDays = useMemo(() => {
    const daysCount = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const dateStr = getLocalDateString(date);
      const label = String(i + 1);
      const isToday = dateStr === todayStr;
      return { day: i + 1, dateStr, label, isToday };
    });
  }, [year, month, todayStr, getLocalDateString]);

  // Compute logs map for fast lookup
  const logsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    logs.forEach(l => {
      map[`${l.habit_id}_${l.log_date}`] = true;
    });
    return map;
  }, [logs]);

  // Generate calendar structure for all 12 months (for Year View)
  const yearlyMonths = useMemo(() => {
    const months = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let m = 0; m < 12; m++) {
      const daysCount = new Date(year, m + 1, 0).getDate();
      const days = Array.from({ length: daysCount }, (_, i) => {
        const date = new Date(year, m, i + 1);
        const dateStr = getLocalDateString(date);
        return {
          dayNum: i + 1,
          dateStr,
          isToday: dateStr === todayStr,
        };
      });
      months.push({ name: monthNames[m], index: m, days });
    }
    return months;
  }, [year, todayStr, getLocalDateString]);

  return (
    <Container>
      <MainContent>
        <DashboardHeader>
          <div>
            <HeaderTitle>
              Habit <span>Tracker</span>
            </HeaderTitle>
          </div>
          <ViewToggleContainer>
            <ViewToggleButton $active={view === 'month'} onClick={() => setView('month')}>
              Month
            </ViewToggleButton>
            <ViewToggleButton $active={view === 'year'} onClick={() => setView('year')}>
              Year
            </ViewToggleButton>
          </ViewToggleContainer>
        </DashboardHeader>

        <GridContainer>
          {/* Left panel: Creator & Habit List */}
          <Panel>
            <PanelTitle>Create Habit</PanelTitle>
            <Form onSubmit={handleCreateHabit}>
              <FormGroup>
                <Label htmlFor="habit-name">Name</Label>
                <Input
                  id="habit-name"
                  type="text"
                  placeholder="e.g. Drink Water"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Color Preset</Label>
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
              <SubmitButton type="submit" disabled={saving || !name.trim()}>
                <Plus size={16} />
                Add Habit
              </SubmitButton>
            </Form>

            <PanelTitle style={{ marginTop: '1rem' }}>Your Habits</PanelTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {habits.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: '#555' }}>No habits added yet.</span>
              ) : (
                habits.map(h => (
                  <HabitItem key={h.id} $color={h.color}>
                    <HabitInfo>
                      <HabitName>{h.name}</HabitName>
                    </HabitInfo>
                    <DeleteButton onClick={() => handleDeleteHabit(h.id)} aria-label={`Delete ${h.name}`}>
                      <Trash2 size={14} />
                    </DeleteButton>
                  </HabitItem>
                ))
              )}
            </div>
          </Panel>

          {/* Right panel: Dashboards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {view === 'month' ? (
              <>
                <CalendarControl>
                  <CalendarNavButton onClick={handlePrevMonth} aria-label="Previous month">
                    <ChevronLeft size={16} />
                  </CalendarNavButton>
                  <CalendarLabel>
                    {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </CalendarLabel>
                  <CalendarNavButton onClick={handleNextMonth} aria-label="Next month">
                    <ChevronRight size={16} />
                  </CalendarNavButton>
                </CalendarControl>

                {loading ? (
                  <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: '#555' }}>
                    <RefreshCw className="animate-spin" size={24} />
                  </div>
                ) : habits.length === 0 ? (
                  <div style={{ border: '1px dashed #222', padding: '4rem', textAlign: 'center', color: '#666' }}>
                    <Calendar size={32} style={{ margin: '0 auto 1rem', color: '#333' }} />
                    <span style={{ fontSize: '0.85rem' }}>Add a habit on the left to start tracking.</span>
                  </div>
                ) : (
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th style={{ width: '160px', textAlign: 'left' }}>Habit</Th>
                          {monthDays.map(d => (
                            <Th key={d.day} $isToday={d.isToday}>
                              {d.label}
                            </Th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {habits.map(h => (
                          <tr key={h.id}>
                            <Td style={{ textOverflow: 'ellipsis' }}>
                              <HabitRowHeader>
                                <ColorIndicator $color={h.color} />
                                <RowHabitName title={h.name}>{h.name}</RowHabitName>
                              </HabitRowHeader>
                            </Td>
                            {monthDays.map(d => {
                              const isChecked = !!logsMap[`${h.id}_${d.dateStr}`];
                              return (
                                <Td key={d.day}>
                                  <CheckSquare
                                    $color={h.color}
                                    $checked={isChecked}
                                    $isToday={d.isToday}
                                    onClick={() => handleToggleLog(h.id, d.dateStr)}
                                    aria-label={`Toggle checkin for ${h.name} on ${d.dateStr}`}
                                  >
                                    {isChecked && <Check size={12} />}
                                  </CheckSquare>
                                </Td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>
                )}
              </>
            ) : (
              <>
                <CalendarControl>
                  <CalendarNavButton onClick={handlePrevYear} aria-label="Previous year">
                    <ChevronLeft size={16} />
                  </CalendarNavButton>
                  <CalendarLabel>{year}</CalendarLabel>
                  <CalendarNavButton onClick={handleNextYear} aria-label="Next year">
                    <ChevronRight size={16} />
                  </CalendarNavButton>
                </CalendarControl>

                {loading ? (
                  <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', color: '#555' }}>
                    <RefreshCw className="animate-spin" size={24} />
                  </div>
                ) : habits.length === 0 ? (
                  <div style={{ border: '1px dashed #222', padding: '4rem', textAlign: 'center', color: '#666' }}>
                    <Activity size={32} style={{ margin: '0 auto 1rem', color: '#333' }} />
                    <span style={{ fontSize: '0.85rem' }}>Add a habit on the left to view the Yearly dashboard.</span>
                  </div>
                ) : (
                  <YearGridWrapper>
                    {habits.map(h => {
                      const totalLogsThisYear = logs.filter(l => l.habit_id === h.id).length;
                      return (
                        <HabitYearCard key={h.id} $color={h.color}>
                          <HabitYearHeader>
                            <HabitYearTitle>
                              <ColorIndicator $color={h.color} />
                              {h.name}
                            </HabitYearTitle>
                            <YearStats>
                              {totalLogsThisYear} check-ins in {year}
                            </YearStats>
                          </HabitYearHeader>
                          <MonthsRow>
                            {yearlyMonths.map(m => (
                              <MonthBox key={m.name}>
                                <MonthLabel>{m.name}</MonthLabel>
                                <DaysPixelGrid>
                                  {m.days.map(d => {
                                    const isChecked = !!logsMap[`${h.id}_${d.dateStr}`];
                                    return (
                                      <PixelCell
                                        key={d.dayNum}
                                        $color={h.color}
                                        $checked={isChecked}
                                        $isToday={d.isToday}
                                        onClick={() => handleToggleLog(h.id, d.dateStr)}
                                        title={`${h.name}: ${d.dateStr}`}
                                      />
                                    );
                                  })}
                                </DaysPixelGrid>
                              </MonthBox>
                            ))}
                          </MonthsRow>
                        </HabitYearCard>
                      );
                    })}
                  </YearGridWrapper>
                )}
              </>
            )}
          </div>
        </GridContainer>
      </MainContent>
    </Container>
  );
}
