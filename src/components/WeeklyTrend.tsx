import styled from 'styled-components';
import { useMemo } from 'react';
import { CardTitle } from './common';
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
  gap: 1rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 160px;
  margin-top: 0.5rem;
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
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
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
          backgroundColor: '#111',
          border: '1px solid #333',
          padding: '0.75rem',
          color: '#fff',
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          borderRadius: '4px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: data.isToday ? '#10b981' : '#ccc' }}>
            {label} ({data.date})
          </div>
          <div>Mood Score: <strong style={{ fontSize: '1rem', color: '#fff' }}>{data.hasData ? data.score : 'No data'}</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <TrendContainer>
      <CardTitle style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
        Weekly Trend
      </CardTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="dayName" 
              tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              tickFormatter={(value, index) => {
                const isToday = index === trendData.length - 1;
                return isToday ? 'TODAY' : value;
              }}
            />
            <YAxis 
              type="number"
              domain={[0, 10]} 
              tick={{ fill: '#555', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#222' }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {trendData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#10b981' : (entry.hasData ? '#fff' : '#222')} 
                  opacity={entry.hasData ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </TrendContainer>
  );
}
