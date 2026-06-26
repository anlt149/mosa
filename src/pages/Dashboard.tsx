import { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { WeeklyTrend } from '../components/WeeklyTrend';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, History, Send, Calendar, Battery, HeartPulse, BookOpen } from 'lucide-react';
import { useVimNavigation } from '../hooks/useVimNavigation';

/* ── Animations ──────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Layout ─────────────────────────────────────────────────── */
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
  
  /* Ensure grids never overflow their containers */
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
  min-width: 0; /* Crucial for preventing flex/grid overflow */
`;

/* ── Premium Cards ──────────────────────────────────────────── */
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

/* ── Alert ──────────────────────────────────────────────────── */
const AlertBanner = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: #fca5a5;
  margin-bottom: 2rem;
`;

/* ── Input Form ─────────────────────────────────────────────── */
const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #27272a;
  padding-bottom: 1rem;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
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
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const InputSection = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ $active }) => $active ? '#18181b' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? '#3f3f46' : 'transparent'};
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e4e4e7;
  font-weight: 600;
  font-size: 0.95rem;

  svg {
    color: #10b981;
  }
`;

const ScoreValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  font-variant-numeric: tabular-nums;
`;

/* ── Beautiful Range Slider ── */
const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 10px 0;
`;

const RangeInput = styled.input<{ $progress: number }>`
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  outline: none;
  position: relative;
  z-index: 2;
  margin: 0;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 8px;
    background: #27272a;
    border-radius: 4px;
    border: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #10b981;
    margin-top: -8px;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    transition: transform 0.1s;
  }

  &::-webkit-slider-thumb:active {
    transform: scale(1.15);
  }

  /* Fill progress effect */
  &::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    height: 8px;
    width: ${({ $progress }) => $progress}%;
    background: linear-gradient(90deg, #059669, #10b981);
    border-radius: 4px;
    z-index: -1;
    pointer-events: none;
  }
`;

const NoteArea = styled.textarea<{ $active: boolean }>`
  width: 100%;
  background: #18181b;
  border: 1px solid ${({ $active }) => $active ? '#10b981' : '#27272a'};
  border-radius: 12px;
  padding: 1rem;
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 1px #10b981;
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

/* ── Journal Notes ── */
const SectionTitle = styled.h3`
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NoteItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #27272a;
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  &:first-child {
    padding-top: 0;
  }
`;

const NoteDate = styled.div`
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 600;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NoteText = styled.div`
  font-size: 0.95rem;
  color: #e4e4e7;
  line-height: 1.5;
  white-space: pre-wrap;
`;

/* ── Toast Notifications ── */
const ToastContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 2000;
  pointer-events: none;
`;

const Toast = styled.div<{ $type: 'success' | 'error' }>`
  background: #18181b;
  border-left: 4px solid ${props => props.$type === 'success' ? '#10b981' : '#ef4444'};
  color: #fff;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

/* ── Interfaces ──────────────────────────────────────────────── */
interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood_score: number;
  energy_level: number;
  note: string | null;
  created_at: string;
}

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get('date');

  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(urlDate || '');
  const [activeSection, setActiveSection] = useState<'mood' | 'energy' | 'note' | 'submit'>('mood');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state with URL parameter if it changes
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      await Promise.resolve();
      if (!ignore && urlDate) {
        setSelectedDate(urlDate);
      }
    };
    run();
    return () => { ignore = true; };
  }, [urlDate]);

  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['daily_logs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 90);
      const pastDateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('log_date', pastDateStr)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data as DailyLog[];
    }
  });

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  
  const activeDate = selectedDate || todayStr;
  const isPastDay = activeDate !== todayStr;
  const selectedLog = logs.find(l => l.log_date === activeDate);

  const missedDaysThisWeek = useMemo(() => {
    const missed = [];
    const current = new Date();
    const dayOfWeek = current.getDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7; 
    
    for (let i = daysSinceMonday; i > 0; i--) {
      const d = new Date();
      d.setDate(current.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!logs.some(l => l.log_date === dateStr)) {
        missed.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    }
    return missed;
  }, [logs]);

  const recentNotes = useMemo(() => {
    return logs
      .filter(l => l.note && l.note.trim().length > 0)
      .slice(0, 5);
  }, [logs]);

  const yesterdayObj = new Date();
  yesterdayObj.setDate(new Date().getDate() - 1);
  const yesterdayStr = `${yesterdayObj.getFullYear()}-${String(yesterdayObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayObj.getDate()).padStart(2, '0')}`;
  const yesterdayLog = logs.find(l => l.log_date === yesterdayStr);

  const showToast = useCallback((text: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useVimNavigation({
    activeSection,
    setActiveSection,
    mood,
    setMood,
    energy,
    setEnergy,
    onSubmit: () => handleSubmit(),
    disabled: false
  });

  useEffect(() => {
    const activeDate = selectedDate || todayStr;
    const existing = logs.find(l => l.log_date === activeDate);
    if (existing) {
      setMood(existing.mood_score);
      setEnergy(existing.energy_level);
      setNote(existing.note || '');
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
    }
  }, [selectedDate, logs, todayStr]);

  const submitMutation = useMutation({
    mutationFn: async (newLog: { log_date: string, mood_score: number, energy_level: number, note: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User session not found.');

      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          ...newLog
        }, { onConflict: 'user_id,log_date' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
      showToast(selectedLog ? 'Log updated successfully.' : 'Log submitted successfully.', 'success');
      setActiveSection('mood');
    },
    onError: () => {
      showToast('Failed to save log.', 'error');
    }
  });

  const handleSubmit = useCallback(() => {
    submitMutation.mutate({
      log_date: selectedDate || todayStr,
      mood_score: mood,
      energy_level: energy,
      note
    });
  }, [mood, energy, note, selectedDate, todayStr, submitMutation]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSearchParams({ date: dateStr });
    setActiveSection('mood');
  };

  const handleSameAsYesterday = () => {
    if (yesterdayLog) {
      setMood(yesterdayLog.mood_score);
      setEnergy(yesterdayLog.energy_level);
      setNote(yesterdayLog.note || '');
      showToast('Copied from yesterday', 'success');
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Mood <span>Tracker</span></Title>
      </Header>

      {missedDaysThisWeek.length > 0 && (
        <AlertBanner>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Forgot to log?</strong>
            You missed logging your mood on: {missedDaysThisWeek.join(', ')}.
          </div>
        </AlertBanner>
      )}

      <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
        <FormHeader>
          <DateDisplay>
            <Calendar size={20} color="#10b981" />
            {isPastDay ? activeDate : 'Today'}
          </DateDisplay>
          
          {!isPastDay && (
            <ActionButton 
              onClick={handleSameAsYesterday}
              disabled={!yesterdayLog}
            >
              <History size={14} />
              Copy Yesterday
            </ActionButton>
          )}
        </FormHeader>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <InputSection 
              $active={activeSection === 'mood'} 
              onClick={() => setActiveSection('mood')}
            >
              <LabelRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HeartPulse size={18} /> Mood
                </div>
                <ScoreValue>{mood}</ScoreValue>
              </LabelRow>
              <SliderWrapper>
                <RangeInput 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={mood} 
                  $progress={(mood / 10) * 100}
                  onChange={e => setMood(parseInt(e.target.value))}
                />
              </SliderWrapper>
            </InputSection>

            <InputSection 
              $active={activeSection === 'energy'} 
              onClick={() => setActiveSection('energy')}
            >
              <LabelRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Battery size={18} /> Energy
                </div>
                <ScoreValue>{energy}</ScoreValue>
              </LabelRow>
              <SliderWrapper>
                <RangeInput 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={energy} 
                  $progress={(energy / 10) * 100}
                  onChange={e => setEnergy(parseInt(e.target.value))}
                />
              </SliderWrapper>
            </InputSection>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <NoteArea
              style={{ flex: 1 }}
              placeholder="Journal your day..."
              value={note}
              $active={activeSection === 'note'}
              onFocus={() => setActiveSection('note')}
              onChange={e => setNote(e.target.value)}
            />
            <SubmitButton 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending}
              onFocus={() => setActiveSection('submit')}
            >
              <Send size={18} />
              {submitMutation.isPending ? 'Saving...' : (selectedLog ? 'Update Entry' : 'Save Entry')}
            </SubmitButton>
          </div>
        </div>
      </Card>

      <DashboardGrid>
        <Column>
          <Card>
            <ActivityHeatmap
              logs={logs}
              onSelectDate={handleDateSelect}
              selectedDate={activeDate}
            />
          </Card>
          {recentNotes.length > 0 && (
            <Card>
              <SectionTitle>
                <BookOpen size={18} color="#10b981" />
                Recent Journal Notes
              </SectionTitle>
              <div>
                {recentNotes.map(log => (
                  <NoteItem key={log.id}>
                    <NoteDate>
                      {new Date(log.log_date + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </NoteDate>
                    <NoteText>{log.note}</NoteText>
                  </NoteItem>
                ))}
              </div>
            </Card>
          )}
        </Column>

        <Column>
          <Card>
            <WeeklyTrend logs={logs} />
          </Card>
        </Column>
      </DashboardGrid>

      <ToastContainer>
        {toasts.map(toast => (
          <Toast key={toast.id} $type={toast.type}>
            {toast.text}
          </Toast>
        ))}
      </ToastContainer>
    </PageContainer>
  );
}
