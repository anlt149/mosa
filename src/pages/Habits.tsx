import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, MainContent, Card, CardTitle } from '../components/common';
import { Plus, Trash2, Check } from 'lucide-react';
import { HabitHeatmap, type HabitLog } from '../components/HabitHeatmap';
import { useSearchParams } from 'react-router-dom';

/* ── Animations ────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Styled Components ─────────────────────────────────────── */
const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;

  @media (min-width: 992px) {
    grid-template-columns: 1.2fr 1fr;
    align-items: start;
  }
`;

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

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #222;
  overflow: hidden;
  width: 100%;
  min-width: 0;
`;

const ViewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
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
  margin-bottom: 0.5rem;
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

const CheckinItem = styled.div<{ $color: string; $checked: boolean; $isPastDay: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background-color: #0b0b0b;
  border: 2px solid ${props => props.$checked ? props.$color : '#333'};
  transition: border-color 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: ${props => props.$color};
  }
`;

const CheckSquare = styled.div<{ $color: string; $checked: boolean }>`
  width: 28px;
  height: 28px;
  background: ${props => props.$checked ? props.$color : 'transparent'};
  border: 2px solid ${props => props.$checked ? props.$color : '#444'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  transition: all 0.15s ease;
`;

interface Habit {
  id: string;
  name: string;
  color: string;
}

const PRESET_COLORS = [
  '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', 
  '#f43f5e', '#f97316', '#eab308', '#14b8a6',
];

export function Habits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get('date');

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(urlDate || '');

  // Sync state with URL parameter
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      await Promise.resolve();
      if (!ignore && urlDate) {
        setSelectedDate(urlDate);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [urlDate]);

  const today = new Date().toISOString().split('T')[0];
  const isPastDay = !!(selectedDate && selectedDate !== today);
  const activeDate = selectedDate || today;

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch habits
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (habitsData) setHabits(habitsData);

    // Fetch logs (last 90 days to populate heatmap)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('id, habit_id, log_date')
      .gte('log_date', ninetyDaysAgo.toISOString().split('T')[0]);

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

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSearchParams({ date: dateStr });
  };

  const handleToggleLog = async (habitId: string) => {
    const existingLog = logs.find(l => l.habit_id === habitId && l.log_date === activeDate);

    if (existingLog) {
      setLogs(logs.filter(l => l.id !== existingLog.id));
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      if (error) fetchData(); // rollback
    } else {
      const tempId = crypto.randomUUID();
      const newLog = { id: tempId, habit_id: habitId, log_date: activeDate };
      setLogs([...logs, newLog]);
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, log_date: activeDate })
        .select();
      
      if (error) {
        fetchData(); // rollback
      } else if (data) {
        setLogs(prev => prev.map(l => l.id === tempId ? data[0] : l));
      }
    }
  };

  const logsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    logs.forEach(l => {
      map[`${l.habit_id}_${l.log_date}`] = true;
    });
    return map;
  }, [logs]);

  return (
    <Container>
      <MainContent>
        <DashboardHeader>
          <div>
            <HeaderTitle>
              Habit <span>Tracker</span>
            </HeaderTitle>
          </div>
        </DashboardHeader>

        <PageLayout>
          {/* Left Column Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
            {/* Heatmap */}
            <Card>
              <HabitHeatmap
                logs={logs}
                totalHabits={habits.length}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
              />
            </Card>

            {/* Manage Habits */}
            <Card>
              <CardTitle style={{ borderBottom: '1px solid #222', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Manage Habits
              </CardTitle>
              
              {!showForm ? (
                <SubmitButton type="button" onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>
                  <Plus size={16} />
                  Add Habit
                </SubmitButton>
              ) : (
                <Form onSubmit={handleCreateHabit} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #333' }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <SubmitButton type="submit" disabled={saving || !name.trim()} style={{ flex: 1 }}>
                      Save
                    </SubmitButton>
                    <SubmitButton
                      type="button"
                      style={{ flex: 1, background: 'transparent', color: '#888', borderColor: '#222' }}
                      onClick={() => { setShowForm(false); setName(''); }}
                    >
                      Cancel
                    </SubmitButton>
                  </div>
                </Form>
              )}

              <div>
                {habits.length === 0 ? (
                  <span style={{ fontSize: '0.75rem', color: '#555' }}>No habits configured.</span>
                ) : (
                  habits.map(h => (
                    <HabitItem key={h.id} $color={h.color}>
                      <HabitName>{h.name}</HabitName>
                      <DeleteButton onClick={() => handleDeleteHabit(h.id)} aria-label={`Delete ${h.name}`}>
                        <Trash2 size={14} />
                      </DeleteButton>
                    </HabitItem>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (Data Entry) */}
          <Card>
            <FormHeader>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', minWidth: 0 }}>
                {!isPastDay ? `Today — ${today}` : `Entry — ${selectedDate}`}
              </CardTitle>
            </FormHeader>

            <ViewSection>
              {habits.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No habits to check in. Add some on the left!
                </div>
              ) : (
                habits.map(h => {
                  const isChecked = !!logsMap[`${h.id}_${activeDate}`];
                  return (
                    <CheckinItem 
                      key={h.id} 
                      $color={h.color} 
                      $checked={isChecked}
                      $isPastDay={isPastDay}
                      onClick={() => handleToggleLog(h.id)}
                    >
                      <span style={{ fontSize: '1rem', color: isChecked ? '#fff' : '#ccc', fontWeight: isChecked ? 'bold' : 'normal' }}>
                        {h.name}
                      </span>
                      <CheckSquare $color={h.color} $checked={isChecked}>
                        {isChecked && <Check size={16} />}
                      </CheckSquare>
                    </CheckinItem>
                  );
                })
              )}
            </ViewSection>
          </Card>
        </PageLayout>
      </MainContent>
    </Container>
  );
}
