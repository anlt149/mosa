import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, MainContent, Input } from '../components/common';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { useState, useEffect, useCallback } from 'react';

/* ── Layout ─────────────────────────────────────────────────── */

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`;

/* ── Section card ───────────────────────────────────────────── */

const Section = styled.div<{ $active: boolean }>`
  border: 2px solid ${props => props.$active ? '#fff' : '#333'};
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const Tick = styled.div<{ $active: boolean }>`
  flex: 1;
  height: 4px;
  background-color: ${props => props.$active ? '#fff' : '#333'};
  transition: background-color 0.1s;
`;

/* ── Submit button ───────────────────────────────────────────── */

const SubmitButton = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? '#fff' : '#333'};
  background-color: ${props => props.$active ? '#fff' : '#000'};
  color: ${props => props.$active ? '#000' : '#666'};
  transition: all 0.15s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    border-color: #fff;
    color: #fff;
    background: #000;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

/* ── Header bar ─────────────────────────────────────────────── */

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid #222;
`;

const LogoutLink = styled.span`
  font-size: 0.8rem;
  color: #555;
  cursor: pointer;
  text-decoration: underline;
  &:hover { color: #aaa; }
`;

/* ══════════════════════════════════════════════════════════════ */

export function Dashboard() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const isEditMode = selectedDate && selectedDate !== today;

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

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /* ── Handlers ──────────────────────────────────────────────── */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

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
    if (!isEditMode) { setMood(5); setEnergy(5); setNote(''); }
    setSelectedDate('');
  }, [mood, energy, note, selectedDate, isEditMode, fetchLogs, submitting, today]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
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
  };

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <Container>
      <MainContent>
        <PageLayout>

          {/* ── Heatmap (top) ── */}
          <Card style={{ padding: '1.5rem' }}>
            <ActivityHeatmap
              logs={logs}
              onSelectDate={handleDateSelect}
              selectedDate={selectedDate}
            />
          </Card>

          {/* ── Data Entry ── */}
          <Card>
            <Header>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                {isEditMode ? `Editing ${selectedDate}` : `Today — ${today}`}
              </CardTitle>
              <LogoutLink onClick={handleLogout}>Logout</LogoutLink>
            </Header>

            {/* Mood 0–10 */}
            <Section $active={true}>
              <SectionTitle color="#aaa">Mood (0–10)</SectionTitle>
              <ScoreRow>
                <StepButton
                  onClick={() => setMood(v => Math.max(0, v - 1))}
                  disabled={mood <= 0}
                  aria-label="Decrease mood"
                >−</StepButton>
                <ScoreDisplay>{mood}</ScoreDisplay>
                <StepButton
                  onClick={() => setMood(v => Math.min(10, v + 1))}
                  disabled={mood >= 10}
                  aria-label="Increase mood"
                >+</StepButton>
              </ScoreRow>
              <TickBar>
                {Array.from({ length: 11 }, (_, i) => (
                  <Tick key={i} $active={i <= mood} />
                ))}
              </TickBar>
            </Section>

            {/* Energy 0–10 */}
            <Section $active={true}>
              <SectionTitle color="#aaa">Energy (0–10)</SectionTitle>
              <ScoreRow>
                <StepButton
                  onClick={() => setEnergy(v => Math.max(0, v - 1))}
                  disabled={energy <= 0}
                  aria-label="Decrease energy"
                >−</StepButton>
                <ScoreDisplay>{energy}</ScoreDisplay>
                <StepButton
                  onClick={() => setEnergy(v => Math.min(10, v + 1))}
                  disabled={energy >= 10}
                  aria-label="Increase energy"
                >+</StepButton>
              </ScoreRow>
              <TickBar>
                {Array.from({ length: 11 }, (_, i) => (
                  <Tick key={i} $active={i <= energy} />
                ))}
              </TickBar>
            </Section>

            {/* Note */}
            <Input
              id="note-input"
              placeholder="One-line journal (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
            />

            {/* Submit */}
            <SubmitButton
              $active={!submitting}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving…' : isEditMode ? 'Update' : 'Submit'}
            </SubmitButton>
          </Card>

        </PageLayout>
      </MainContent>
    </Container>
  );
}
