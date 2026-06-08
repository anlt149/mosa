import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, MainContent, TextArea } from '../components/common';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { useState, useEffect, useCallback } from 'react';
import { useVimNavigation } from '../hooks/useVimNavigation';

/* ── Layout ─────────────────────────────────────────────────── */

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    max-width: 960px;
    align-items: start;
  }
`;

/* ── Section card ───────────────────────────────────────────── */

const Section = styled.div<{ $active: boolean; $isPastDay?: boolean }>`
  border: 2px solid ${props => {
    if (!props.$active) return '#333';
    return props.$isPastDay ? '#ffb300' : '#fff';
  }};
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #0b0b0b;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${props => props.color || '#fff'};
`;

/* ── Score row (+/- controls) ────────────────────────────────── */

const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const ScoreDisplay = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
  min-width: 4rem;
  text-align: center;
  color: inherit;
`;

const StepButton = styled.button`
  background: none;
  border: 2px solid #444;
  color: #fff;
  font-size: 1.75rem;
  line-height: 1;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #fff;
  }
  &:active {
    background: #fff;
    color: #000;
  }
  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

/* ── Tick bar (visual only, no click) ────────────────────────── */

const TickBar = styled.div`
  display: flex;
  gap: 3px;
`;

const Tick = styled.div<{ $active: boolean; $isPastDay?: boolean }>`
  flex: 1;
  height: 4px;
  background-color: ${props => {
    if (!props.$active) return '#222';
    return props.$isPastDay ? '#ffb300' : '#fff';
  }};
  transition: background-color 0.1s;
`;

/* ── Submit button ───────────────────────────────────────────── */

const SubmitButton = styled.button<{ $active: boolean; $isPastDay?: boolean }>`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  border: 2px solid ${props => {
    if (!props.$active) return '#333';
    return props.$isPastDay ? '#ffb300' : '#fff';
  }};
  background-color: ${props => {
    if (!props.$active) return '#000';
    return props.$isPastDay ? '#ffb300' : '#fff';
  }};
  color: ${props => {
    if (!props.$active) return '#666';
    return props.$isPastDay ? '#000' : '#000';
  }};
  transition: all 0.15s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    border-color: ${props => props.$isPastDay ? '#ffb300' : '#fff'};
    color: ${props => props.$isPastDay ? '#ffb300' : '#fff'};
    background: #000;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/* ── Form card header ───────────────────────────────────────── */

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #222;
  overflow: hidden;
`;

const ViewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SecondaryButton = styled.button`
  flex: 1;
  background: none;
  border: 1px solid #333;
  color: #aaa;
  padding: 0.85rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #fff;
    color: #fff;
  }
`;

const DangerButton = styled.button`
  flex: 1;
  background: none;
  border: 1px solid #422;
  color: #c88;
  padding: 0.85rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #f88;
    color: #f88;
    background: #190e0e;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  pointer-events: none;
`;

const Toast = styled.div<{ $type: 'success' | 'error' }>`
  background: #111;
  border: 2px solid ${props => props.$type === 'success' ? '#10b981' : '#ef4444'};
  color: #fff;
  padding: 0.85rem 1.25rem;
  font-family: inherit;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  animation: slideInTop 0.2s ease-out;
  pointer-events: auto;

  @keyframes slideInTop {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background: #111;
  border: 2px solid #ef4444;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ModalBody = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #ccc;
  line-height: 1.5;
`;

const RecentNotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NoteItem = styled.div<{ $selected: boolean }>`
  background: #090909;
  border: 1px solid ${props => props.$selected ? '#fff' : '#222'};
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    border-color: #555;
    background: #121212;
  }
`;

const NoteItemDate = styled.span<{ $selected: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$selected ? '#fff' : '#888'};
  font-weight: bold;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const NoteItemText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #ccc;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  mood_score: number;
  energy_level: number;
  note: string | null;
  tags?: string[];
  created_at: string;
}

const NOTIFICATION_MESSAGES = {
  SUCCESS: {
    SUBMIT: 'Daily log submitted successfully.',
    UPDATE: 'Daily log updated successfully.',
    DELETE: 'Daily log deleted successfully.',
  },
  ERROR: {
    SUBMIT: 'Failed to save log: ',
    DELETE: 'Failed to delete log: ',
    AUTH: 'User session not found.',
  }
} as const;

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

/* ══════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeSection, setActiveSection] = useState<'mood' | 'energy' | 'note' | 'submit'>('mood');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isPastDay = !!(selectedDate && selectedDate !== today);
  const activeDate = selectedDate || today;
  const selectedLog = logs.find(l => l.log_date === activeDate);

  const showToast = useCallback((text: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Run Vim navigation hook
  useVimNavigation({
    activeSection,
    setActiveSection,
    mood,
    setMood,
    energy,
    setEnergy,
    onSubmit: () => {
      handleSubmit();
    },
    disabled: false
  });

  /* ── Data fetching ─────────────────────────────────────────── */

  const fetchLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) console.error('Error fetching logs:', error);
    else if (data) setLogs(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  // Reactive Form Hydration
  useEffect(() => {
    const activeDate = selectedDate || today;
    const existing = logs.find(l => l.log_date === activeDate);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (existing) {
      setMood(existing.mood_score);
      setEnergy(existing.energy_level);
      setNote(existing.note || '');
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedDate, logs, today]);

  /* ── Handlers ──────────────────────────────────────────────── */

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      showToast(NOTIFICATION_MESSAGES.ERROR.AUTH, 'error');
      return;
    }

    const logDate = selectedDate || today;

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: user.id,
        log_date: logDate,
        mood_score: mood,
        energy_level: energy,
        note,
      }, { onConflict: 'user_id,log_date' });

    if (error) {
      console.error('Error submitting log:', error);
      showToast(NOTIFICATION_MESSAGES.ERROR.SUBMIT + error.message, 'error');
    } else {
      await fetchLogs();
      showToast(
        selectedLog ? NOTIFICATION_MESSAGES.SUCCESS.UPDATE : NOTIFICATION_MESSAGES.SUCCESS.SUBMIT,
        'success'
      );
    }
    setSubmitting(false);
  }, [mood, energy, note, selectedDate, selectedLog, fetchLogs, submitting, today, showToast]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const targetDate = selectedDate || today;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast(NOTIFICATION_MESSAGES.ERROR.AUTH, 'error');
      return;
    }

    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('log_date', targetDate);

    if (error) {
      console.error('Error deleting log:', error);
      showToast(NOTIFICATION_MESSAGES.ERROR.DELETE + error.message, 'error');
    } else {
      await fetchLogs();
      showToast(NOTIFICATION_MESSAGES.SUCCESS.DELETE, 'success');
      if (selectedDate) {
        setSelectedDate('');
      }
    }
  };

  const handleReset = () => {
    if (isPastDay) {
      setSelectedDate('');
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
    }
    setActiveSection('mood');
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveSection('mood');
  };

  /* ── Render ────────────────────────────────────────────────── */

  const recentNotes = logs
    .filter(log => log.note && log.note.trim() !== '')
    .slice(0, 5);

  return (
    <Container>
      <MainContent>
        <PageLayout>

          {/* Left Column Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
            {/* Heatmap */}
            <Card style={{ padding: '1.5rem' }}>
              <ActivityHeatmap
                logs={logs}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate}
              />
            </Card>

            {/* Recent Notes */}
            <Card style={{ padding: '1.5rem' }}>
              <CardTitle style={{ borderBottom: '1px solid #222', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Recent Notes
              </CardTitle>
              {recentNotes.length > 0 ? (
                <RecentNotesList>
                  {recentNotes.map((log) => {
                    const isSelected = selectedDate === log.log_date;
                    return (
                      <NoteItem
                        key={log.id}
                        $selected={isSelected}
                        onClick={() => handleDateSelect(log.log_date)}
                      >
                        <NoteItemDate $selected={isSelected}>
                          {log.log_date}
                        </NoteItemDate>
                        <NoteItemText>{log.note}</NoteItemText>
                      </NoteItem>
                    );
                  })}
                </RecentNotesList>
              ) : (
                <div style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                  No journal notes recorded yet.
                </div>
              )}
            </Card>
          </div>

          {/* ── Details / Data Entry (right/bottom) ── */}
          <Card>
            <FormHeader>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {!isPastDay ? `Today — ${today}` : `Editing History — ${selectedDate}`}
              </CardTitle>
            </FormHeader>

            <ViewSection>
              {/* Mood 0–10 */}
              <Section 
                $active={activeSection === 'mood'} 
                $isPastDay={isPastDay}
                onClick={() => setActiveSection('mood')}
                style={{ cursor: 'pointer' }}
              >
                <SectionTitle color={activeSection === 'mood' ? (isPastDay ? '#ffb300' : '#fff') : '#aaa'}>
                  Mood (0–10)
                </SectionTitle>
                <ScoreRow>
                  <StepButton
                    onClick={(e) => { e.stopPropagation(); setMood(v => Math.max(0, v - 1)); }}
                    disabled={mood <= 0}
                    aria-label="Decrease mood"
                  >−</StepButton>
                  <ScoreDisplay>{mood}</ScoreDisplay>
                  <StepButton
                    onClick={(e) => { e.stopPropagation(); setMood(v => Math.min(10, v + 1)); }}
                    disabled={mood >= 10}
                    aria-label="Increase mood"
                  >+</StepButton>
                </ScoreRow>
                <TickBar>
                  {Array.from({ length: 11 }, (_, i) => (
                    <Tick key={i} $active={i <= mood} $isPastDay={isPastDay} />
                  ))}
                </TickBar>
              </Section>

              {/* Energy 0–10 */}
              <Section 
                $active={activeSection === 'energy'} 
                $isPastDay={isPastDay}
                onClick={() => setActiveSection('energy')}
                style={{ cursor: 'pointer' }}
              >
                <SectionTitle color={activeSection === 'energy' ? (isPastDay ? '#ffb300' : '#fff') : '#aaa'}>
                  Energy (0–10)
                </SectionTitle>
                <ScoreRow>
                  <StepButton
                    onClick={(e) => { e.stopPropagation(); setEnergy(v => Math.max(0, v - 1)); }}
                    disabled={energy <= 0}
                    aria-label="Decrease energy"
                  >−</StepButton>
                  <ScoreDisplay>{energy}</ScoreDisplay>
                  <StepButton
                    onClick={(e) => { e.stopPropagation(); setEnergy(v => Math.min(10, v + 1)); }}
                    disabled={energy >= 10}
                    aria-label="Increase energy"
                  >+</StepButton>
                </ScoreRow>
                <TickBar>
                  {Array.from({ length: 11 }, (_, i) => (
                    <Tick key={i} $active={i <= energy} $isPastDay={isPastDay} />
                  ))}
                </TickBar>
              </Section>

              {/* Note */}
              <TextArea
                id="note-input"
                placeholder="How was your day? (journal note)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                onFocus={() => setActiveSection('note')}
                style={{
                  border: activeSection === 'note' ? `2px solid ${isPastDay ? '#ffb300' : '#fff'}` : '1px solid #333',
                  transition: 'border-color 0.2s ease',
                }}
              />

              {/* Submit */}
              <SubmitButton
                $active={activeSection === 'submit'}
                $isPastDay={isPastDay}
                onClick={handleSubmit}
                disabled={submitting}
                onFocus={() => setActiveSection('submit')}
              >
                {submitting ? 'Saving…' : selectedLog ? 'Update Entry' : 'Submit Entry'}
              </SubmitButton>

              {/* Secondary Actions Row */}
              <ActionRow style={{ height: '44px' }}>
                <SecondaryButton onClick={handleReset}>
                  {isPastDay ? 'Cancel / Back' : 'Clear Form'}
                </SecondaryButton>
                <DangerButton 
                  onClick={handleDelete}
                  disabled={!selectedLog}
                  style={{ opacity: selectedLog ? 1 : 0.3, cursor: selectedLog ? 'pointer' : 'default' }}
                >
                  Delete Log
                </DangerButton>
              </ActionRow>
            </ViewSection>
          </Card>

        </PageLayout>
      </MainContent>

      {showDeleteConfirm && (
        <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Entry?</ModalTitle>
            <ModalBody>
              Are you sure you want to permanently delete the log entry for {activeDate}? This action cannot be undone.
            </ModalBody>
            <ActionRow style={{ height: '44px' }}>
              <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </SecondaryButton>
              <DangerButton onClick={confirmDelete} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                Delete
              </DangerButton>
            </ActionRow>
          </ModalContent>
        </ModalOverlay>
      )}

      <ToastContainer>
        {toasts.map(toast => (
          <Toast key={toast.id} $type={toast.type}>
            {toast.text}
          </Toast>
        ))}
      </ToastContainer>
    </Container>
  );
}

