import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, MainContent } from '../components/common';
import { 
  Calendar, 
  Smile, 
  Battery, 
  Flame, 
  BookOpen, 
  Edit3, 
  PlusCircle, 
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/* ── Layout and Containers ──────────────────────────────────── */

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    grid-template-columns: 2.2fr 1fr;
    align-items: start;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid #222;
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const YearControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #111;
  border: 1px solid #333;
  padding: 0.25rem 0.5rem;
`;

const YearButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, transform 0.1s;

  &:hover {
    color: #fff;
  }

  &:active {
    transform: scale(0.9);
  }
`;

const YearLabel = styled.span`
  font-size: 1.1rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  color: #fff;
  min-width: 4.5rem;
  text-align: center;
`;

/* ── Statistics Grid ────────────────────────────────────────── */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: #0b0b0b;
  border: 1px solid #222;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
`;

const StatSubtext = styled.span`
  font-size: 0.7rem;
  color: #444;
`;

/* ── Pixel Grid ─────────────────────────────────────────────── */

const GridWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  background: #0b0b0b;
  border: 1px solid #222;
  padding: 1.5rem;
  box-sizing: border-box;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #000;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const ColumnHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 24px repeat(12, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  min-width: 300px;
`;

const MonthHeaderLabel = styled.div`
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #888;
  text-align: center;
  user-select: none;
`;

const DayRow = styled.div`
  display: grid;
  grid-template-columns: 24px repeat(12, 1fr);
  gap: 4px;
  margin-bottom: 4px;
  align-items: center;
  min-width: 300px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DayLabel = styled.div`
  font-size: 0.65rem;
  font-weight: bold;
  color: #555;
  text-align: right;
  padding-right: 6px;
  user-select: none;
`;

const Pixel = styled.div<{ $color: string; $isValid: boolean; $selected: boolean }>`
  aspect-ratio: 1;
  background-color: ${props => props.$color};
  border: ${props => {
    if (!props.$isValid) return '1px dashed #222';
    if (props.$selected) return '2px solid #fff';
    return '1px solid transparent';
  }};
  border-radius: 2px;
  cursor: ${props => props.$isValid ? 'pointer' : 'default'};
  transition: transform 0.1s, border-color 0.1s;
  position: relative;

  &:hover {
    transform: ${props => props.$isValid ? 'scale(1.15)' : 'none'};
    z-index: 2;
    border-color: ${props => props.$isValid && !props.$selected ? '#888' : ''};
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  font-size: 0.75rem;
  color: #666;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.$color};
  border-radius: 2px;
`;

/* ── Info / Preview Panel ───────────────────────────────────── */

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const DetailCard = styled(Card)`
  border: 1px solid #333;
  background-color: #0b0b0b;
`;

const DetailDate = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MetricRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ccc;
`;

const MetricProgressTrack = styled.div`
  height: 6px;
  background-color: #222;
  border-radius: 3px;
  overflow: hidden;
`;

const MetricProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background-color: ${props => props.$color};
  transition: width 0.3s ease;
`;

const NoteQuote = styled.div`
  border-left: 2px solid #555;
  padding-left: 0.75rem;
  color: #ccc;
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
  }
`;

const ActionButton = styled.button<{ $primary: boolean }>`
  width: 100%;
  padding: 0.75rem;
  font-family: inherit;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  border: 1px solid ${props => props.$primary ? '#fff' : '#333'};
  background: ${props => props.$primary ? '#fff' : 'transparent'};
  color: ${props => props.$primary ? '#000' : '#aaa'};
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;

  &:hover {
    background: ${props => props.$primary ? '#000' : '#111'};
    color: #fff;
    border-color: #fff;
  }
`;

/* ── Breakdown Visuals ──────────────────────────────────────── */

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const BreakdownItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const BreakdownInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #aaa;
`;

const BreakdownLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreakdownColorDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  background-color: ${props => props.$color};
  border-radius: 50%;
`;

const DoubleBar = styled.div<{ $width: number; $color: string }>`
  height: 6px;
  background: #222;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$width}%;
    background-color: ${props => props.$color};
    border-radius: 3px;
  }
`;

/* ── Component Types ────────────────────────────────────────── */

interface LogEntry {
  id: string;
  log_date: string;
  mood_score: number;
  energy_level: number;
  note: string | null;
}

const MONTHS_CONFIG = [
  { name: 'Jan', index: 0 },
  { name: 'Feb', index: 1 },
  { name: 'Mar', index: 2 },
  { name: 'Apr', index: 3 },
  { name: 'May', index: 4 },
  { name: 'Jun', index: 5 },
  { name: 'Jul', index: 6 },
  { name: 'Aug', index: 7 },
  { name: 'Sep', index: 8 },
  { name: 'Oct', index: 9 },
  { name: 'Nov', index: 10 },
  { name: 'Dec', index: 11 },
];

const INTENSITY_COLORS = {
  empty: '#161b22',
  low: '#450a0a',      // Red (<0.3)
  medLow: '#b45309',   // Orange (<0.6)
  medHigh: '#0284c7',  // Blue (<0.8)
  high: '#10b981',     // Green (>=0.8)
};

const getIntensityColor = (intensity: number, hasData: boolean) => {
  if (!hasData) return INTENSITY_COLORS.empty;
  if (intensity < 0.3) return INTENSITY_COLORS.low;
  if (intensity < 0.6) return INTENSITY_COLORS.medLow;
  if (intensity < 0.8) return INTENSITY_COLORS.medHigh;
  return INTENSITY_COLORS.high;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

/* ── Main Component ─────────────────────────────────────────── */

export function YearInPixels() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);

  // Fetch all logs for the selected year
  const fetchYearLogs = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('daily_logs')
      .select('id, log_date, mood_score, energy_level, note')
      .gte('log_date', `${selectedYear}-01-01`)
      .lte('log_date', `${selectedYear}-12-31`)
      .order('log_date', { ascending: true });

    if (error) {
      console.error('Error fetching logs for year:', error);
    } else if (data) {
      setLogs(data as LogEntry[]);
    }
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => {
    fetchYearLogs();
  }, [fetchYearLogs]);

  // Index logs by date YYYY-MM-DD for O(1) lookup
  const logsMap = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc[log.log_date] = log;
      return acc;
    }, {} as Record<string, LogEntry>);
  }, [logs]);

  // Handle year transitions
  const handlePrevYear = () => setSelectedYear(y => y - 1);
  const handleNextYear = () => setSelectedYear(y => y + 1);

  // Statistics calculations
  const stats = useMemo(() => {
    const totalDays = logs.length;
    if (totalDays === 0) {
      return {
        totalTracked: 0,
        completionRate: 0,
        avgMood: 0,
        avgEnergy: 0,
        streak: 0,
        breakdown: { low: 0, medLow: 0, medHigh: 0, high: 0 },
        happiestDay: null as LogEntry | null,
      };
    }

    let moodSum = 0;
    let energySum = 0;
    let lowCount = 0;
    let medLowCount = 0;
    let medHighCount = 0;
    let highCount = 0;
    let happiest: LogEntry | null = null;
    let highestIntensity = -1;

    logs.forEach(log => {
      moodSum += log.mood_score;
      energySum += log.energy_level;

      const intensity = (log.mood_score / 10 * 0.5) + (log.energy_level / 10 * 0.5);
      if (intensity < 0.3) lowCount++;
      else if (intensity < 0.6) medLowCount++;
      else if (intensity < 0.8) medHighCount++;
      else highCount++;

      if (intensity > highestIntensity) {
        highestIntensity = intensity;
        happiest = log;
      }
    });

    // Calculate streak
    const datesSet = new Set(logs.map(l => l.log_date));
    let maxStreak = 0;
    let currentStreak = 0;
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (datesSet.has(dStr)) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    const yearLength = (selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0)) ? 366 : 365;

    return {
      totalTracked: totalDays,
      completionRate: Math.round((totalDays / yearLength) * 100),
      avgMood: Math.round((moodSum / totalDays) * 10) / 10,
      avgEnergy: Math.round((energySum / totalDays) * 10) / 10,
      streak: maxStreak,
      breakdown: { low: lowCount, medLow: medLowCount, medHigh: medHighCount, high: highCount },
      happiestDay: happiest as LogEntry | null,
    };
  }, [logs, selectedYear]);

  // Active preview item
  const activeDate = hoveredDateStr || selectedDateStr;
  const activeLog = activeDate ? logsMap[activeDate] : null;

  const handlePixelClick = (dateStr: string, isValid: boolean) => {
    if (!isValid) return;
    if (selectedDateStr === dateStr) {
      setSelectedDateStr(null);
    } else {
      setSelectedDateStr(dateStr);
    }
  };

  const handleNavigateToJournal = (dateStr: string) => {
    navigate(`/journal?date=${dateStr}`);
  };

  const formattedActiveDate = useMemo(() => {
    if (!activeDate) return '';
    const [year, month, day] = activeDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('default', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [activeDate]);

  return (
    <Container>
      <MainContent>
        {/* Header Section */}
        <HeaderRow>
          <PageTitle>
            <Calendar size={22} style={{ color: '#aaa' }} />
            Year in Pixels
          </PageTitle>
          <YearControls>
            <YearButton onClick={handlePrevYear} aria-label="Previous Year">
              <ChevronLeft size={18} />
            </YearButton>
            <YearLabel>{selectedYear}</YearLabel>
            <YearButton onClick={handleNextYear} aria-label="Next Year">
              <ChevronRight size={18} />
            </YearButton>
          </YearControls>
        </HeaderRow>

        {loading ? (
          <div style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3rem', textAlign: 'center' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Quick Stats Summary */}
            <StatsGrid>
              <StatCard>
                <StatLabel>
                  <TrendingUp size={12} />
                  Completion
                </StatLabel>
                <StatValue>{stats.completionRate}%</StatValue>
                <StatSubtext>{stats.totalTracked} / {selectedYear % 4 === 0 ? '366' : '365'} days</StatSubtext>
              </StatCard>

              <StatCard>
                <StatLabel>
                  <Smile size={12} />
                  Avg Mood
                </StatLabel>
                <StatValue>{stats.avgMood || '—'}</StatValue>
                <StatSubtext>Out of 10</StatSubtext>
              </StatCard>

              <StatCard>
                <StatLabel>
                  <Battery size={12} />
                  Avg Energy
                </StatLabel>
                <StatValue>{stats.avgEnergy || '—'}</StatValue>
                <StatSubtext>Out of 10</StatSubtext>
              </StatCard>

              <StatCard>
                <StatLabel>
                  <Flame size={12} />
                  Max Streak
                </StatLabel>
                <StatValue>{stats.streak} days</StatValue>
                <StatSubtext>Consecutive entries</StatSubtext>
              </StatCard>
            </StatsGrid>

            {/* Main Content Layout */}
            <PageLayout>
              {/* Left Column: Pixels Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minWidth: 0 }}>
                <GridWrapper>
                  {/* Column Headers: Months (Jan - Dec) */}
                  <ColumnHeaderRow>
                    <div /> {/* Day label placeholder */}
                    {MONTHS_CONFIG.map(month => (
                      <MonthHeaderLabel key={month.index}>
                        {month.name}
                      </MonthHeaderLabel>
                    ))}
                  </ColumnHeaderRow>

                  {/* Day Rows: 1-31 */}
                  {Array.from({ length: 31 }, (_, dayIdx) => {
                    const dayNum = dayIdx + 1;
                    return (
                      <DayRow key={dayNum}>
                        <DayLabel>{dayNum}</DayLabel>
                        {MONTHS_CONFIG.map(month => {
                          const daysInMonth = getDaysInMonth(selectedYear, month.index);
                          const isValid = dayNum <= daysInMonth;
                          const dateStr = `${selectedYear}-${String(month.index + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                          
                          const log = logsMap[dateStr];
                          const hasData = !!log;
                          const intensity = hasData ? (log.mood_score / 10 * 0.5) + (log.energy_level / 10 * 0.5) : 0;
                          const color = isValid ? getIntensityColor(intensity, hasData) : 'transparent';
                          const isSelected = selectedDateStr === dateStr;

                          return (
                            <Pixel
                              key={month.index}
                              $color={color}
                              $isValid={isValid}
                              $selected={isSelected}
                              onMouseEnter={() => isValid && setHoveredDateStr(dateStr)}
                              onMouseLeave={() => setHoveredDateStr(null)}
                              onClick={() => handlePixelClick(dateStr, isValid)}
                              title={isValid && hasData ? `${dateStr}: Mood ${log.mood_score}/10 | Energy ${log.energy_level}/10` : isValid ? `${dateStr}: Unlogged` : undefined}
                            />
                          );
                        })}
                      </DayRow>
                    );
                  })}
                </GridWrapper>

                {/* Grid Legend */}
                <LegendRow>
                  <span>Less</span>
                  <LegendColor $color={INTENSITY_COLORS.empty} title="No Data" />
                  <LegendColor $color={INTENSITY_COLORS.low} title="Low (1-3)" />
                  <LegendColor $color={INTENSITY_COLORS.medLow} title="Medium-Low (4-5)" />
                  <LegendColor $color={INTENSITY_COLORS.medHigh} title="Medium-High (6-7)" />
                  <LegendColor $color={INTENSITY_COLORS.high} title="High (8-10)" />
                  <span>More</span>
                </LegendRow>
              </div>

              {/* Right Column: Sidebar (Preview & Breakdown) */}
              <SidePanel>
                {activeDate ? (
                  /* Date Entry Preview */
                  <DetailCard>
                    <CardTitle style={{ paddingBottom: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>DAY INSPECTOR</span>
                      {selectedDateStr && (
                        <button 
                          style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
                          onClick={() => setSelectedDateStr(null)}
                        >
                          Clear Lock
                        </button>
                      )}
                    </CardTitle>

                    <DetailDate>
                      <Calendar size={14} />
                      {formattedActiveDate}
                    </DetailDate>

                    {activeLog ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Mood score */}
                        <MetricRow>
                          <MetricHeader>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Smile size={14} /> Mood
                            </span>
                            <span>{activeLog.mood_score} / 10</span>
                          </MetricHeader>
                          <MetricProgressTrack>
                            <MetricProgressFill 
                              $width={activeLog.mood_score * 10} 
                              $color={getIntensityColor((activeLog.mood_score / 10 * 0.5) + (activeLog.energy_level / 10 * 0.5), true)} 
                            />
                          </MetricProgressTrack>
                        </MetricRow>

                        {/* Energy level */}
                        <MetricRow>
                          <MetricHeader>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Battery size={14} /> Energy
                            </span>
                            <span>{activeLog.energy_level} / 10</span>
                          </MetricHeader>
                          <MetricProgressTrack>
                            <MetricProgressFill 
                              $width={activeLog.energy_level * 10} 
                              $color={getIntensityColor((activeLog.mood_score / 10 * 0.5) + (activeLog.energy_level / 10 * 0.5), true)} 
                            />
                          </MetricProgressTrack>
                        </MetricRow>

                        {/* Note section */}
                        {activeLog.note && activeLog.note.trim() !== '' ? (
                          <MetricRow>
                            <MetricHeader>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <BookOpen size={14} /> Journal Note
                              </span>
                            </MetricHeader>
                            <NoteQuote>
                              "{activeLog.note}"
                            </NoteQuote>
                          </MetricRow>
                        ) : (
                          <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            No journal note for this day.
                          </div>
                        )}

                        <ActionButton 
                          $primary={true} 
                          onClick={() => handleNavigateToJournal(activeLog.log_date)}
                        >
                          <Edit3 size={14} />
                          Edit in Journal
                        </ActionButton>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
                        <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>
                          No tracking logged for this date.
                        </div>
                        <ActionButton 
                          $primary={true} 
                          onClick={() => handleNavigateToJournal(activeDate)}
                        >
                          <PlusCircle size={14} />
                          Log this day
                        </ActionButton>
                      </div>
                    )}
                  </DetailCard>
                ) : (
                  /* General Breakdown Dashboard */
                  <DetailCard>
                    <CardTitle style={{ paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                      YEARLY BREAKDOWN
                    </CardTitle>

                    {stats.totalTracked > 0 ? (
                      <BreakdownList>
                        <BreakdownItem>
                          <BreakdownInfo>
                            <BreakdownLabel>
                              <BreakdownColorColorDot $color={INTENSITY_COLORS.high} />
                              High (8-10)
                            </BreakdownLabel>
                            <span>
                              {stats.breakdown.high} days ({Math.round(stats.breakdown.high / stats.totalTracked * 100)}%)
                            </span>
                          </BreakdownInfo>
                          <DoubleBar $width={stats.breakdown.high / stats.totalTracked * 100} $color={INTENSITY_COLORS.high} />
                        </BreakdownItem>

                        <BreakdownItem>
                          <BreakdownInfo>
                            <BreakdownLabel>
                              <BreakdownColorColorDot $color={INTENSITY_COLORS.medHigh} />
                              Med-High (6-7)
                            </BreakdownLabel>
                            <span>
                              {stats.breakdown.medHigh} days ({Math.round(stats.breakdown.medHigh / stats.totalTracked * 100)}%)
                            </span>
                          </BreakdownInfo>
                          <DoubleBar $width={stats.breakdown.medHigh / stats.totalTracked * 100} $color={INTENSITY_COLORS.medHigh} />
                        </BreakdownItem>

                        <BreakdownItem>
                          <BreakdownInfo>
                            <BreakdownLabel>
                              <BreakdownColorColorDot $color={INTENSITY_COLORS.medLow} />
                              Med-Low (4-5)
                            </BreakdownLabel>
                            <span>
                              {stats.breakdown.medLow} days ({Math.round(stats.breakdown.medLow / stats.totalTracked * 100)}%)
                            </span>
                          </BreakdownInfo>
                          <DoubleBar $width={stats.breakdown.medLow / stats.totalTracked * 100} $color={INTENSITY_COLORS.medLow} />
                        </BreakdownItem>

                        <BreakdownItem>
                          <BreakdownInfo>
                            <BreakdownLabel>
                              <BreakdownColorColorDot $color={INTENSITY_COLORS.low} />
                              Low (1-3)
                            </BreakdownLabel>
                            <span>
                              {stats.breakdown.low} days ({Math.round(stats.breakdown.low / stats.totalTracked * 100)}%)
                            </span>
                          </BreakdownInfo>
                          <DoubleBar $width={stats.breakdown.low / stats.totalTracked * 100} $color={INTENSITY_COLORS.low} />
                        </BreakdownItem>

                        {/* Happiest Day Mini Spotlight */}
                        {stats.happiestDay && (
                          <div style={{ marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Sparkles size={12} style={{ color: '#ffb300' }} />
                              Peak Performance Day
                            </div>
                            <div style={{ background: '#070707', border: '1px solid #222', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePixelClick(stats.happiestDay!.log_date, true)}>
                              <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{new Date(stats.happiestDay.log_date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}</span>
                                <span style={{ color: '#10b981' }}>Mood {stats.happiestDay.mood_score} | Energy {stats.happiestDay.energy_level}</span>
                              </div>
                              {stats.happiestDay.note && (
                                <div style={{ fontSize: '0.75rem', color: '#aaa', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  "{stats.happiestDay.note}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </BreakdownList>
                    ) : (
                      <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                        Start logging your daily mood and energy in the journal to view your annual metrics breakdown!
                      </div>
                    )}
                  </DetailCard>
                )}
              </SidePanel>
            </PageLayout>
          </>
        )}
      </MainContent>
    </Container>
  );
}

/* Helper styled dot to avoid collision/naming issue */
const BreakdownColorColorDot = styled(BreakdownColorDot)`
  flex-shrink: 0;
`;
