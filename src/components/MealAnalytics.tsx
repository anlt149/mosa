import { useMemo } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Meal } from '../services/mealService';

const Card = styled.div`
  background: #09090b;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }
`;

const Title = styled.h2`
  color: #fff;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

interface MealAnalyticsProps {
  meals: Meal[];
}

export function MealAnalytics({ meals }: MealAnalyticsProps) {
  // Process data for the last 7 days
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = meals.filter(m => m.created_at.startsWith(dateStr));
      
      const eatOutCost = dayMeals
        .filter(m => m.location_type === 'eat_out')
        .reduce((sum, m) => sum + (m.cost_vnd || 0), 0);
        
      const eatHomeCost = dayMeals
        .filter(m => m.location_type === 'eat_home')
        .reduce((sum, m) => sum + (m.cost_vnd || 0), 0);

      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        'Eat Out': eatOutCost,
        'Eat Home': eatHomeCost,
      };
    });
  }, [meals]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#fff', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color, margin: 0, fontSize: '0.9rem' }}>
              {entry.name}: {entry.value.toLocaleString('en-US')} ₫
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <Title>Spending Trends (Last 7 Days)</Title>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="Eat Out" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Eat Home" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
