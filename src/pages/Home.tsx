import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { PageContainer, PageHeader, Grid } from '../components/common';
import { BookOpen, LayoutGrid, ArrowRight, Activity, Zap, Smile, CheckSquare } from 'lucide-react';

/* ── Animations ────────────────────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;


const Greeting = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0;
  
  span {
    color: #10b981;
  }
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #a1a1aa;
  margin: 0;
  margin-top: 0.5rem;
`;

/* ── Minimal Dashboard Quick Stats ──────────────────────────── */

const QuickStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MiniStatCard = styled.div`
  background: #0b0b0b;
  border: 1px solid #222;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
  overflow: hidden;
`;

const MiniStatLabel = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const MiniStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #fff;
`;



const FeatureCard = styled.div<{ $glowColor: string }>`
  background: #111;
  border: 1px solid #333;
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.$glowColor};
    opacity: 0.6;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-5px);
    border-color: #fff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${props => props.$glowColor}15;
    
    &::before {
      opacity: 1;
    }

    .action-arrow {
      transform: translateX(4px);
      color: #fff;
    }
  }
`;

const CardTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const IconContainer = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: #000;
  border: 1px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  margin-bottom: 0.25rem;
  transition: border-color 0.3s;

  ${FeatureCard}:hover & {
    border-color: ${props => props.$color};
  }
`;

const CardTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.5;
  margin: 0;
`;

const CardAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  font-weight: bold;
  transition: color 0.2s;

  .action-arrow {
    transition: transform 0.2s, color 0.2s;
  }
`;

interface LogEntry {
  log_date: string;
  mood_score: number;
  energy_level: number;
}

export function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user identity
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email) {
        const namePart = user.email.split('@')[0];
        setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    });

    // Fetch logs to compute minimal summary metrics
    const fetchLogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, mood_score, energy_level')
        .order('log_date', { ascending: false });

      if (!error && data) {
        setLogs(data as LogEntry[]);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  // Compute stats metrics
  const stats = useMemo(() => {
    const totalCount = logs.length;
    if (totalCount === 0) {
      return { total: 0, streak: 0, averageMood: 0 };
    }

    // Average Mood
    const sumMood = logs.reduce((acc, log) => acc + log.mood_score, 0);
    const avgMood = Math.round((sumMood / totalCount) * 10) / 10;

    // Streak
    const datesSet = new Set(logs.map(l => l.log_date));
    let maxStreak = 0;
    let currentStreak = 0;
    const today = new Date();
    
    // Check backwards from today to find current/longest streak
    const start = new Date(today);
    start.setDate(today.getDate() - 365); // Check past year
    
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (datesSet.has(dStr)) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    return {
      total: totalCount,
      streak: maxStreak,
      averageMood: avgMood,
    };
  }, [logs]);

  return (
    <PageContainer style={{ maxWidth: '960px' }}>
      <PageHeader style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <Greeting>
          Hello, <span>{userName || 'User'}</span>
        </Greeting>
        <Subtitle>Welcome back to Mosa. Choose a workspace below to get started.</Subtitle>
      </PageHeader>

        {/* Aggregate Quick Stats */}
        {!loading && (
          <QuickStatsRow>
            <MiniStatCard>
              <MiniStatLabel>
                <Activity size={12} style={{ color: '#10b981' }} />
                Total Logged
              </MiniStatLabel>
              <MiniStatValue>{stats.total} days</MiniStatValue>
            </MiniStatCard>

            <MiniStatCard>
              <MiniStatLabel>
                <Zap size={12} style={{ color: '#ffb300' }} />
                Best Streak
              </MiniStatLabel>
              <MiniStatValue>{stats.streak} days</MiniStatValue>
            </MiniStatCard>

            <MiniStatCard>
              <MiniStatLabel>
                <Smile size={12} style={{ color: '#0284c7' }} />
                Avg Mood
              </MiniStatLabel>
              <MiniStatValue>{stats.averageMood ? `${stats.averageMood}/10` : '—'}</MiniStatValue>
            </MiniStatCard>
          </QuickStatsRow>
        )}

        {/* Feature selection cards */}
        <Grid $cols={2} style={{ animation: `${fadeIn} 0.7s ease-out` }}>
          <FeatureCard  
            $glowColor="#10b981" 
            onClick={() => navigate('/journal')}
          >
            <CardTop>
              <IconContainer $color="#10b981">
                <BookOpen size={24} />
              </IconContainer>
              <CardTitle>Daily Journal</CardTitle>
              <CardDescription>
                Track your daily mood, energy levels, and write journal notes. Log today's reflections and view recent summaries.
              </CardDescription>
            </CardTop>
            <CardAction>
              Open Journal Logger
              <ArrowRight size={14} className="action-arrow" />
            </CardAction>
          </FeatureCard>

          <FeatureCard 
            $glowColor="#0284c7" 
            onClick={() => navigate('/year')}
          >
            <CardTop>
              <IconContainer $color="#0284c7">
                <LayoutGrid size={24} />
              </IconContainer>
              <CardTitle>Year in Pixels</CardTitle>
              <CardDescription>
                View your complete year's timeline rendered in a single pixel canvas. Discover streaks, mood stats, and peak performance spotlights.
              </CardDescription>
            </CardTop>
            <CardAction>
              Open Yearly Canvas
              <ArrowRight size={14} className="action-arrow" />
            </CardAction>
          </FeatureCard>

          <FeatureCard 
            $glowColor="#8b5cf6" 
            onClick={() => navigate('/habits')}
          >
            <CardTop>
              <IconContainer $color="#8b5cf6">
                <CheckSquare size={24} />
              </IconContainer>
              <CardTitle>Habit Tracker</CardTitle>
              <CardDescription>
                Track multiple daily habits with custom colors. Check in daily and monitor progress in a monthly matrix or yearly pixels dashboard.
              </CardDescription>
            </CardTop>
            <CardAction>
              Open Habit Tracker
              <ArrowRight size={14} className="action-arrow" />
            </CardAction>
          </FeatureCard>
        </Grid>
    </PageContainer>
  );
}
