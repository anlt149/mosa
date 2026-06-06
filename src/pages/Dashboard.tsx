import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, Button, MainContent, Input } from '../components/common';
import { useVimNavigation } from '../hooks/useVimNavigation';
import { ActivityHeatmap } from '../components/ActivityHeatmap';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;

  @media (min-width: 850px) {
    grid-template-columns: 400px 1fr;
  }
`;

const Section = styled.div<{ $active: boolean }>`
  border: 2px solid ${props => props.$active ? '#fff' : '#333'};
  padding: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.color || '#fff'};
`;

const ScoreDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
`;

const Slider = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

const SliderTick = styled.div<{ $active: boolean }>`
  height: 20px;
  flex: 1;
  background-color: ${props => props.$active ? '#fff' : '#333'};
  transition: background-color 0.1s;
`;

const SubmitButton = styled(Button)<{ $active: boolean }>`
  border-color: ${props => props.$active ? '#fff' : '#333'};
  background-color: ${props => props.$active ? '#fff' : '#000'};
  color: ${props => props.$active ? '#000' : '#666'};
  padding: 1rem;
  font-size: 1.25rem;
  margin-top: 1rem;
`;

export function Dashboard() {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [activeSection, setActiveSection] = useState<'mood' | 'energy' | 'submit'>('mood');
  const [logs, setLogs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // empty means today/new entry
  const isEditMode = selectedDate && selectedDate !== new Date().toISOString().split('T')[0];

  const fetchLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch last 90 days of logs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateStr = ninetyDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', dateStr)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else if (data) {
      setLogs(data);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const logDate = selectedDate || new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: user.id,
        log_date: logDate,
        mood_score: mood,
        energy_level: energy,
        note: note,
      }, {
        onConflict: 'user_id,log_date',
      });

    if (error) {
      console.error('Error submitting log:', error);
      alert('Failed to submit log: ' + error.message);
    } else {
      fetchLogs();
    }
    setSubmitting(false);
    // Reset after new entry
    if (!isEditMode) {
      setMood(3);
      setEnergy(5);
      setNote('');
    }
    setSelectedDate('');
  }, [mood, energy, note, selectedDate, isEditMode, fetchLogs, submitting]);

  useVimNavigation({
    activeSection,
    setActiveSection,
    mood,
    setMood,
    energy,
    setEnergy,
    onSubmit: handleSubmit
  });

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Find existing log for this date if any
    const existing = logs.find(l => l.log_date === dateStr);
    if (existing) {
      setMood(existing.mood_score);
      setEnergy(existing.energy_level);
      setNote(existing.note || '');
    } else {
      setMood(3);
      setEnergy(5);
      setNote('');
    }
    setActiveSection('mood');
  };

  return (
    <Container>
      <MainContent>
        <DashboardGrid>
          
          {/* Left Column: Data Entry */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>Daily Log</CardTitle>
              <span style={{ fontSize: '0.875rem', color: '#666', cursor: 'pointer', textDecoration: 'underline' }} onClick={handleLogout}>Logout</span>
            </div>

            <Section $active={activeSection === 'mood'} onClick={() => setActiveSection('mood')}>
              <SectionHeader>
                <SectionTitle color={activeSection === 'mood' ? '#fff' : '#666'}>Mood (1-5)</SectionTitle>
              </SectionHeader>
              <ScoreDisplay style={{ color: activeSection === 'mood' ? '#fff' : '#666' }}>{mood}</ScoreDisplay>
              <Slider>
                {[1, 2, 3, 4, 5].map(val => (
                  <SliderTick key={val} $active={val <= mood} onClick={() => setMood(val)} />
                ))}
              </Slider>
            </Section>

            {/* Energy Section */}
            <Section $active={activeSection === 'energy'} onClick={() => setActiveSection('energy')}>
              <SectionHeader>
                <SectionTitle color={activeSection === 'energy' ? '#fff' : '#666'}>Energy (1-10)</SectionTitle>
              </SectionHeader>
              <ScoreDisplay style={{ color: activeSection === 'energy' ? '#fff' : '#666' }}>{energy}</ScoreDisplay>
              <Slider>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <SliderTick key={val} $active={val <= energy} onClick={() => setEnergy(val)} />
                ))}
              </Slider>
            </Section>

            {/* Note Input */}
            <Input
              placeholder="One‑line journal (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ marginTop: '0.5rem' }}
            />

            {/* Submit / Update */}
            <SubmitButton 
              $active={activeSection === 'submit'} 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'SAVING...' : (isEditMode ? 'UPDATE (ENTER)' : 'SUBMIT (ENTER)')}
            </SubmitButton>

            <div style={{ color: '#666', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>
              <strong style={{color:'#aaa'}}>j/k</strong> up/down &nbsp;|&nbsp; <strong style={{color:'#aaa'}}>h/l</strong> left/right
            </div>
          </Card>

          {/* Right Column: Visualization */}
          <Card style={{ padding: '2rem' }}>
            <ActivityHeatmap logs={logs} onSelectDate={handleDateSelect} selectedDate={selectedDate} />
          </Card>

        </DashboardGrid>
      </MainContent>
    </Container>
  );
}
