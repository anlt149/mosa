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

/* ── View Mode components ────────────────────────────────────── */

const ViewSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MetricCard = styled.div`
  background: #111;
  border: 1px solid #222;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MetricName = styled.span`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
`;

const MetricValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
`;

const ReadOnlyTicks = styled.div`
  display: flex;
  gap: 3px;
  margin-top: 0.25rem;
`;

const ReadOnlyTick = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 4px;
  background-color: ${props => props.$active ? '#fff' : '#222'};
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const NoteLabel = styled.span`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
`;

const NoteBlock = styled.div`
  background: #090909;
  border-left: 3px solid #666;
  padding: 1.25rem;
  font-size: 1rem;
  color: #eee;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
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

const PrimaryActionButton = styled.button<{ $isPastDay?: boolean }>`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  border: 2px solid ${props => props.$isPastDay ? '#ffb300' : '#fff'};
  background-color: ${props => props.$isPastDay ? '#ffb300' : '#fff'};
  color: #000;
  transition: all 0.15s;

  &:hover {
    background: #000;
    color: ${props => props.$isPastDay ? '#ffb300' : '#fff'};
  }
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

/* ══════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [activeSection, setActiveSection] = useState<'mood' | 'energy' | 'note' | 'submit'>('mood');

  const today = new Date().toISOString().split('T')[0];
  const isPastDay = !!(selectedDate && selectedDate !== today);
  const selectedLog = logs.find(l => l.log_date === selectedDate);
  const isEditing = !isPastDay || isEditingSelected;

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
    disabled: !isEditing
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

  /* ── Handlers ──────────────────────────────────────────────── */

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

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
      alert('Failed to save: ' + error.message);
    } else {
      await fetchLogs();
    }

    setSubmitting(false);
    if (isPastDay) {
      setIsEditingSelected(false);
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
      setSelectedDate('');
    }
  }, [mood, energy, note, selectedDate, isPastDay, fetchLogs, submitting, today]);

  const handleDelete = async () => {
    if (!selectedDate) return;
    if (!confirm(`Are you sure you want to delete the log for ${selectedDate}?`)) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('log_date', selectedDate);

    if (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log: ' + error.message);
    } else {
      await fetchLogs();
      setSelectedDate('');
      setIsEditingSelected(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSelected(false);
    if (selectedLog) {
      setMood(selectedLog.mood_score);
      setEnergy(selectedLog.energy_level);
      setNote(selectedLog.note || '');
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
    }
    setActiveSection('mood');
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsEditingSelected(false);
    const existing = logs.find(l => l.log_date === dateStr);
    if (existing) {
      setMood(existing.mood_score);
      setEnergy(existing.energy_level);
      setNote(existing.note || '');
    } else {
      setMood(5);
      setEnergy(5);
      setNote('');
    }
    setActiveSection('mood');
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <Container>
      <MainContent>
        <PageLayout>

          {/* ── Heatmap (left/top) ── */}
          <Card style={{ padding: '1.5rem' }}>
            <ActivityHeatmap
              logs={logs}
              onSelectDate={handleDateSelect}
              selectedDate={selectedDate}
            />
          </Card>

          {/* ── Details / Data Entry (right/bottom) ── */}
          <Card>
            <FormHeader>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {!isPastDay ? `Today — ${today}` : isEditing ? `Editing — ${selectedDate}` : `Details — ${selectedDate}`}
              </CardTitle>
            </FormHeader>

            {!isEditing ? (
              // CASE A: Read-Only Detail View of Past Log
              selectedLog ? (
                <ViewSection>
                  <MetricCard>
                    <MetricHeader>
                      <MetricName>Mood Score</MetricName>
                      <MetricValue>{selectedLog.mood_score}/10</MetricValue>
                    </MetricHeader>
                    <ReadOnlyTicks>
                      {Array.from({ length: 11 }, (_, i) => (
                        <ReadOnlyTick key={i} $active={i <= selectedLog.mood_score} />
                      ))}
                    </ReadOnlyTicks>
                  </MetricCard>

                  <MetricCard>
                    <MetricHeader>
                      <MetricName>Energy Level</MetricName>
                      <MetricValue>{selectedLog.energy_level}/10</MetricValue>
                    </MetricHeader>
                    <ReadOnlyTicks>
                      {Array.from({ length: 11 }, (_, i) => (
                        <ReadOnlyTick key={i} $active={i <= selectedLog.energy_level} />
                      ))}
                    </ReadOnlyTicks>
                  </MetricCard>

                  <NoteContainer>
                    <NoteLabel>Journal Note</NoteLabel>
                    <NoteBlock>
                      {selectedLog.note ? (
                        selectedLog.note
                      ) : (
                        <span style={{ color: '#555', fontStyle: 'italic' }}>
                          No journal entry recorded for this day.
                        </span>
                      )}
                    </NoteBlock>
                  </NoteContainer>

                  <ButtonGroup>
                    <PrimaryActionButton $isPastDay={true} onClick={() => setIsEditingSelected(true)}>
                      Edit Log
                    </PrimaryActionButton>
                    <ActionRow>
                      <SecondaryButton onClick={() => setSelectedDate('')}>
                        Back to Today
                      </SecondaryButton>
                      <DangerButton onClick={handleDelete}>
                        Delete Log
                      </DangerButton>
                    </ActionRow>
                  </ButtonGroup>
                </ViewSection>
              ) : (
                // Selected past day has no log
                <ViewSection style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ color: '#888', marginBottom: '1.5rem' }}>
                    No log recorded for {selectedDate}.
                  </div>
                  <ButtonGroup>
                    <PrimaryActionButton $isPastDay={true} onClick={() => setIsEditingSelected(true)}>
                      Log This Day
                    </PrimaryActionButton>
                    <SecondaryButton onClick={() => setSelectedDate('')}>
                      Back to Today
                    </SecondaryButton>
                  </ButtonGroup>
                </ViewSection>
              )
            ) : (
              // CASE B: Edit Form (Today or editing past day)
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
                  {submitting ? 'Saving…' : isPastDay ? 'Update' : 'Submit'}
                </SubmitButton>

                {/* Cancel (only if past day is being edited) */}
                {isPastDay && (
                  <SecondaryButton onClick={handleCancelEdit}>
                    Cancel
                  </SecondaryButton>
                )}
              </ViewSection>
            )}
          </Card>

        </PageLayout>
      </MainContent>
    </Container>
  );
}

