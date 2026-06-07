
import { useState } from 'react';
import styled from 'styled-components';

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeatmapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeatmapTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #fff;
  text-align: center;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  &:hover {
    color: #fff;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  padding-bottom: 0.5rem;
`;

const DaySquare = styled.div<{ $intensity: number; $isPlaceholder: boolean; $selected: boolean }>`
  aspect-ratio: 1;
  border-radius: 2px;
  background-color: ${({ $intensity, $isPlaceholder }) => {
    if ($isPlaceholder) return 'transparent';
    if ($intensity === 0) return '#161b22'; // Empty
    if ($intensity < 0.3) return '#0e4429';
    if ($intensity < 0.6) return '#006d32';
    if ($intensity < 0.8) return '#26a641';
    return '#39d353'; // High
  }};
  border: ${({ $selected }) => $selected ? '2px solid #fff' : '2px solid transparent'};
  position: relative;
  cursor: ${({ $isPlaceholder }) => $isPlaceholder ? 'default' : 'pointer'};
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 10;
    margin-bottom: 4px;
    pointer-events: none;
    display: ${({ $isPlaceholder }) => $isPlaceholder ? 'none' : 'block'};
  }
`;
const DayNumber = styled.div`
  font-size: 0.6rem;
  color: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #666;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const LegendSquare = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

interface ActivityHeatmapProps {
  logs: any[];
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export function ActivityHeatmap({ logs, onSelectDate, selectedDate }: ActivityHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Placeholders
  for (let i = 0; i < firstDay; i++) {
    days.push({ isPlaceholder: true, dateStr: '' });
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ isPlaceholder: false, dateStr: dStr });
  }

  const logMap = logs.reduce((acc, log) => {
    acc[log.log_date] = log;
    return acc;
  }, {} as Record<string, any>);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <HeatmapContainer>
      <HeatmapHeader>
        <NavButton onClick={handlePrevMonth}>&lt; Prev</NavButton>
        <HeatmapTitle>{monthName}</HeatmapTitle>
        <NavButton onClick={handleNextMonth}>Next &gt;</NavButton>
      </HeatmapHeader>

      <Grid>
        {weekDays.map(d => <DayLabel key={d}>{d}</DayLabel>)}

        {days.map((day, idx) => {
          if (day.isPlaceholder) {
            return <DaySquare key={idx} $intensity={0} $isPlaceholder={true} $selected={false} />;
          }

          const log = logMap[day.dateStr];
          let intensity = 0;
          let tooltip = day.dateStr;

          if (log) {
            const moodScore = log.mood_score / 10;
            const energyScore = log.energy_level / 10;
            intensity = (moodScore * 0.5) + (energyScore * 0.5);
            tooltip = `${day.dateStr}: Mood ${log.mood_score}/10 | Energy ${log.energy_level}/10`;
            if (log.note) {
              tooltip += ` | ${log.note}`;
            }
          }

          return (
            <DaySquare
              key={idx}
              $intensity={intensity}
              $isPlaceholder={false}
              $selected={selectedDate === day.dateStr}
              data-tooltip={tooltip}
              onClick={() => onSelectDate(day.dateStr)}
            >
              <DayNumber>{new Date(day.dateStr).getDate()}</DayNumber>
            </DaySquare>
          );
        })}
      </Grid>

      <Legend>
        Less
        <LegendSquare color="#161b22" />
        <LegendSquare color="#0e4429" />
        <LegendSquare color="#006d32" />
        <LegendSquare color="#26a641" />
        <LegendSquare color="#39d353" />
        More
      </Legend>
    </HeatmapContainer>
  );
}
