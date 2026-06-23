import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Meal } from '../services/mealService';

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

const DaySquare = styled.button<{
  $isPlaceholder: boolean;
  $selected: boolean;
  $isToday: boolean;
  $locationType?: 'eat_out' | 'eat_home' | null;
}>`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${({ $isPlaceholder, $locationType }) => {
    if ($isPlaceholder) return 'transparent';
    if ($locationType === 'eat_home') return '#10b981'; // Green
    if ($locationType === 'eat_out') return '#f97316'; // Orange
    return '#18181b'; // Empty
  }};
  
  border: ${({ $selected, $isToday, $isPlaceholder }) => {
    if ($isPlaceholder) return 'none';
    if ($selected) return '2px solid #fff';
    if ($isToday) return '1px solid #a1a1aa';
    return '1px solid transparent';
  }};
  
  /* Use different colors depending on bg */
  color: ${({ $locationType }) => {
    if ($locationType) return '#000'; // Dark text on colored background
    return '#71717a'; // Gray text on empty background
  }};
  
  font-size: 0.85rem;
  font-weight: ${({ $selected, $isToday }) => ($selected || $isToday ? 'bold' : 'normal')};
  cursor: ${({ $isPlaceholder }) => ($isPlaceholder ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  
  &:hover {
    ${({ $isPlaceholder, $selected, $locationType }) => !$isPlaceholder && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${
        $locationType === 'eat_home' ? 'rgba(16, 185, 129, 0.3)' : 
        $locationType === 'eat_out' ? 'rgba(249, 115, 22, 0.3)' : 
        'rgba(255,255,255,0.05)'
      };
      border-color: ${$selected ? '#fff' : '#52525b'};
    `}
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
`;

const LegendText = styled.span`
  font-size: 0.75rem;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

interface MealHeatmapProps {
  meals: Meal[];
  onSelectDate: (dateStr: string) => void;
  selectedDate: string | null;
}

export function MealHeatmap({ meals, onSelectDate, selectedDate }: MealHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const todayStr = useMemo(() => {
    const d = new Date();
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

  // Group meals by date (YYYY-MM-DD string)
  const mealsByDate = useMemo(() => {
    return meals.reduce((acc, meal) => {
      // created_at is an ISO string: "2026-06-23T14:52:00Z"
      // We'll use local date based on the timestamp.
      const d = new Date(meal.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);
  }, [meals]);

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
               <DayCellContainer key={`placeholder-${idx}`}>
                <DaySquare 
                  $isPlaceholder={true} 
                  $selected={false} 
                  $isToday={false} 
                  disabled 
                />
              </DayCellContainer>
            );
          }

          const dayMeals = mealsByDate[day.dateStr] || [];
          // Strategy: pick the first meal's location
          const primaryMeal = dayMeals[0];

          const locationType = primaryMeal?.location_type;
          
          const isSelected = selectedDate === day.dateStr;
          const isToday = todayStr === day.dateStr;

          return (
            <DayCellContainer key={day.dateStr}>
              <DaySquare
                $isPlaceholder={false}
                $selected={isSelected}
                $isToday={isToday}
                $locationType={locationType}
                onClick={() => onSelectDate(day.dateStr)}
              >
                {day.dayNum}
              </DaySquare>
            </DayCellContainer>
          );
        })}
      </Grid>

      <LegendRow>
        <LegendItem>
          <LegendDot $color="#10b981" />
          <LegendText>Eat Home</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#f97316" />
          <LegendText>Eat Out</LegendText>
        </LegendItem>
      </LegendRow>
    </HeatmapContainer>
  );
}
