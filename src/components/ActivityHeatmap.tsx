import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeatmapContainer = styled.div`
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

const MonthTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
`;

const NavControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  color: #a1a1aa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    border-color: #3f3f46;
    background: #27272a;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const WeekdayLabelRow = styled.div`
  display: contents;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #52525b;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const DayCellContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  position: relative;
`;

const DaySquare = styled.button<{ $intensity: number; $isPlaceholder: boolean; $selected: boolean; $isToday: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${({ $intensity, $isPlaceholder }) => {
    if ($isPlaceholder) return 'transparent';
    if ($intensity === 0) return '#18181b'; 
    if ($intensity < 0.3) return '#064e3b'; 
    if ($intensity < 0.6) return '#059669'; 
    if ($intensity < 0.8) return '#10b981'; 
    return '#34d399'; 
  }};
  border: ${({ $selected, $isToday, $isPlaceholder }) => {
    if ($isPlaceholder) return 'none';
    if ($selected) return '2px solid #fff';
    if ($isToday) return '1px solid #10b981';
    return '1px solid transparent';
  }};
  box-shadow: ${({ $intensity, $isPlaceholder }) => {
    if ($isPlaceholder || $intensity === 0) return 'none';
    return 'inset 0 1px 1px rgba(255,255,255,0.1)';
  }};
  color: ${({ $intensity }) => ($intensity > 0.3 ? '#000' : '#71717a')};
  font-size: 0.85rem;
  font-weight: ${({ $selected, $isToday }) => ($selected || $isToday ? 'bold' : 'normal')};
  cursor: ${({ $isPlaceholder }) => ($isPlaceholder ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    ${({ $isPlaceholder, $selected }) => !$isPlaceholder && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      border-color: ${$selected ? '#fff' : '#34d399'};
    `}
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const LegendText = styled.span`
  font-size: 0.75rem;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LegendDots = styled.div`
  display: flex;
  gap: 4px;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
`;

export interface HeatmapLog {
  log_date: string;
  mood_score: number;
  energy_level: number;
  note?: string | null;
}

interface ActivityHeatmapProps {
  logs: HeatmapLog[];
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export function ActivityHeatmap({ logs, onSelectDate, selectedDate }: ActivityHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    // Use local timezone format consistently
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ isPlaceholder: true, dateStr: '', dayNum: 0 });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ isPlaceholder: false, dateStr: dStr, dayNum: i });
    }
    return days;
  }, [currentMonth]);

  const logMap = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.log_date] = log;
      return acc;
    }, {} as Record<string, HeatmapLog>);
  }, [logs]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <HeatmapContainer>
      <HeaderRow>
        <MonthTitle>{monthName}</MonthTitle>
        <NavControls>
          <NavButton onClick={handlePrevMonth} aria-label="Previous Month">
            <ChevronLeft size={18} />
          </NavButton>
          <NavButton onClick={handleNextMonth} aria-label="Next Month">
            <ChevronRight size={18} />
          </NavButton>
        </NavControls>
      </HeaderRow>

      <Grid>
        <WeekdayLabelRow>
          {weekDays.map(d => (
            <DayLabel key={d}>{d[0]}</DayLabel>
          ))}
        </WeekdayLabelRow>

        {calendarDays.map((day, idx) => {
          if (day.isPlaceholder) {
            return (
              <DayCellContainer key={idx}>
                <DaySquare $intensity={0} $isPlaceholder={true} $selected={false} $isToday={false} disabled />
              </DayCellContainer>
            );
          }

          const log = logMap[day.dateStr];
          let intensity = 0;

          if (log) {
            // Formula: weighted average of mood and energy
            const moodScore = log.mood_score / 10;
            const energyScore = log.energy_level / 10;
            intensity = (moodScore * 0.6) + (energyScore * 0.4);
            // Ensure minimum intensity > 0 if logged so it shows up differently than empty
            if (intensity === 0) intensity = 0.1; 
          }

          const isSelected = selectedDate === day.dateStr;
          const isToday = todayStr === day.dateStr;

          return (
            <DayCellContainer key={idx}>
              <DaySquare
                $intensity={intensity}
                $isPlaceholder={false}
                $selected={isSelected}
                $isToday={isToday}
                onClick={() => onSelectDate(day.dateStr)}
              >
                {day.dayNum}
              </DaySquare>
            </DayCellContainer>
          );
        })}
      </Grid>

      <LegendRow>
        <LegendText>Less</LegendText>
        <LegendDots>
          <LegendDot $color="#18181b" />
          <LegendDot $color="#064e3b" />
          <LegendDot $color="#059669" />
          <LegendDot $color="#10b981" />
          <LegendDot $color="#34d399" />
        </LegendDots>
        <LegendText>More</LegendText>
      </LegendRow>
    </HeatmapContainer>
  );
}
