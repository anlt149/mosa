import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, Button } from '../components/common';
import { useVimNavigation } from '../hooks/useVimNavigation';

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

const LogHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #333;
  font-size: 0.875rem;
  color: #aaa;
`;

export function Dashboard() {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(5);
  const [activeSection, setActiveSection] = useState<'mood' | 'energy' | 'submit'>('mood');
  const [logs, setLogs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching logs:', error);
    } else if (data) {
      setLogs(data);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('daily_logs')
      .insert({
        user_id: user.id,
        mood_score: mood,
        energy_level: energy,
      });

    if (error) {
      console.error('Error submitting log:', error);
      alert('Failed to submit log: ' + error.message);
    } else {
      alert('Logged successfully!');
      fetchLogs();
    }
    setSubmitting(false);
  }, [mood, energy, fetchLogs, submitting]);

  useVimNavigation({
    activeSection,
    setActiveSection,
    mood,
    setMood,
    energy,
    setEnergy,
    onSubmit: handleSubmit
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Container>
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
              <SliderTick key={val} $active={val <= mood} />
            ))}
          </Slider>
        </Section>

        <Section $active={activeSection === 'energy'} onClick={() => setActiveSection('energy')}>
          <SectionHeader>
            <SectionTitle color={activeSection === 'energy' ? '#fff' : '#666'}>Energy (1-10)</SectionTitle>
          </SectionHeader>
          <ScoreDisplay style={{ color: activeSection === 'energy' ? '#fff' : '#666' }}>{energy}</ScoreDisplay>
          <Slider>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
              <SliderTick key={val} $active={val <= energy} />
            ))}
          </Slider>
        </Section>

        <SubmitButton 
          $active={activeSection === 'submit'} 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'SAVING...' : 'SUBMIT (ENTER)'}
        </SubmitButton>

        {logs.length > 0 && (
          <LogHistory>
            <h4 style={{ margin: 0, color: '#fff', textTransform: 'uppercase' }}>Recent Logs</h4>
            {logs.map(log => (
              <HistoryItem key={log.id}>
                <span>{new Date(log.log_date).toLocaleDateString()}</span>
                <span>Mood: {log.mood_score} | Energy: {log.energy_level}</span>
              </HistoryItem>
            ))}
          </LogHistory>
        )}

      </Card>
      
      <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem', textAlign: 'center' }}>
        Navigation: <strong style={{color:'#aaa'}}>j/k</strong> up/down &nbsp;|&nbsp; <strong style={{color:'#aaa'}}>h/l</strong> left/right
      </div>
    </Container>
  );
}
