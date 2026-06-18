import styled from 'styled-components';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const TrendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TrendTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
`;

interface DailyLog {
  log_date: string;
  mood_score: number;
}

interface WeeklyTrendProps {
  logs: DailyLog[];
}

export function WeeklyTrend({ logs }: WeeklyTrendProps) {
  const trendData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Generate last 7 days safely matching local timezone date strings
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const log = logs.find(l => l.log_date === dateStr);
      
      data.push({
        date: dateStr,
        dayName,
        isToday: i === 0,
        score: log ? log.mood_score : 0,
        hasData: !!log
      });
    }
    
    return data;
  }, [logs]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#09090b', // deep dark bg
          border: '1px solid #27272a', // zinc-800 border
          padding: '0.75rem 1rem',
          color: '#e4e4e7',
          fontSize: '0.85rem',
          boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ fontWeight: '600', color: data.isToday ? '#10b981' : '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            {data.isToday ? 'Today' : label} ({data.date})
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ color: '#71717a' }}>Mood</span>
            <strong style={{ fontSize: '1.25rem', color: data.hasData ? '#fff' : '#ef4444' }}>
              {data.hasData ? `${data.score} / 10` : 'Missed'}
            </strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <TrendContainer>
      <HeaderRow>
        <TrendTitle>Weekly Trend</TrendTitle>
      </HeaderRow>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="dayName" 
              tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600, textAnchor: 'middle' }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              type="number"
              domain={[0, 10]} 
              tick={{ fill: '#3f3f46', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#18181b', radius: 6 }} 
              animationDuration={200}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0] as [number, number, number, number]} maxBarSize={48}>
              {trendData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // If it's today and has data -> bright emerald
                  // If past day and has data -> subtle emerald/teal
                  // If no data -> very dark zinc
                  fill={
                    entry.hasData 
                      ? (entry.isToday ? '#10b981' : '#047857') 
                      : '#18181b'
                  } 
                  style={{
                    transition: 'fill 0.3s ease',
                    filter: entry.hasData && entry.isToday ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' : 'none'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </TrendContainer>
  );
}
