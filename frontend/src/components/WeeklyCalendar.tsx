import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReservationItem } from '../types';

// ---- Constants ------------------------------------------------------------

const START_HOUR = 8;
const END_HOUR = 20;
const CELL_HEIGHT = 48; // px per hour
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// ---- Helpers --------------------------------------------------------------

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ---- Props ----------------------------------------------------------------

interface WeeklyCalendarProps {
  events: ReservationItem[];
  loading?: boolean;
  error?: string | null;
  onWeekChange: (start: Date, end: Date) => void;
}

// ---- Component ------------------------------------------------------------

export default function WeeklyCalendar({
  events,
  loading = false,
  error = null,
  onWeekChange,
}: WeeklyCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU';

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Notify parent whenever week changes
  useEffect(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    onWeekChange(weekStart, weekEnd);
  }, [weekStart, onWeekChange]);

  const prevWeek = () =>
    setWeekStart((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 7);
      return nd;
    });

  const nextWeek = () =>
    setWeekStart((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 7);
      return nd;
    });

  const goToday = () => setWeekStart(getMonday(new Date()));

  const getEventsForDay = (day: Date) =>
    events.filter((r) => isSameDay(new Date(r.start_time), day));

  const weekLabel = `${weekDays[0].toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })} – ${weekDays[6].toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;

  const totalHeight = HOURS.length * CELL_HEIGHT;

  return (
    <div className="calendar">
      {/* Navigation */}
      <div className="calendar-nav">
        <button className="btn-secondary" onClick={prevWeek} type="button">
          ←
        </button>
        <span className="calendar-nav-title">{weekLabel}</span>
        <button
          className="btn-secondary calendar-nav-btn--today"
          onClick={goToday}
          type="button"
        >
          {t('reservations.today')}
        </button>
        <button className="btn-secondary" onClick={nextWeek} type="button">
          →
        </button>
      </div>

      {/* Status */}
      {loading && (
        <p className="calendar-status calendar-status--loading">
          {t('reservations.loading')}
        </p>
      )}
      {error && (
        <p className="calendar-status calendar-status--error">{error}</p>
      )}

      {/* Header row */}
      <div className="calendar-header">
        <div className="calendar-header-corner" />
        {weekDays.map((day, i) => (
          <div
            key={i}
            className={`calendar-header-cell${isSameDay(day, today) ? ' is-today' : ''}`}
          >
            <div>{day.toLocaleDateString(locale, { weekday: 'short' })}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 400, color: 'inherit' }}>
              {day.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
            </div>
          </div>
        ))}
      </div>

      {/* Body: time column + day columns */}
      <div className="calendar-body">
        <div className="calendar-time-col">
          {HOURS.map((h) => (
            <div key={h} className="calendar-time-label">
              {pad(h)}:00
            </div>
          ))}
        </div>

        {weekDays.map((day, di) => (
          <div
            key={di}
            className="calendar-day-col"
            style={{ height: `${totalHeight}px` }}
          >
            {HOURS.map((h) => (
              <div key={h} className="calendar-cell" />
            ))}

            {getEventsForDay(day).map((r) => {
              const start = new Date(r.start_time);
              const end = new Date(r.end_time);

              const startDecimal = start.getHours() + start.getMinutes() / 60;
              const endDecimal = end.getHours() + end.getMinutes() / 60;

              const clampedStart = Math.max(startDecimal, START_HOUR);
              const clampedEnd = Math.min(endDecimal, END_HOUR);

              if (clampedEnd <= clampedStart) return null;

              const top = (clampedStart - START_HOUR) * CELL_HEIGHT;
              const height = Math.max((clampedEnd - clampedStart) * CELL_HEIGHT, 18);

              return (
                <div
                  key={r.id}
                  className="calendar-event"
                  style={{ top: `${top}px`, height: `${height}px` }}
                  title={`${r.title}\n${r.room.name} · ${r.room.building.name}\n${pad(start.getHours())}:${pad(start.getMinutes())} – ${pad(end.getHours())}:${pad(end.getMinutes())}`}
                >
                  <div className="calendar-event-title">{r.title}</div>
                  {height >= 32 && (
                    <div className="calendar-event-time">
                      {pad(start.getHours())}:{pad(start.getMinutes())} –{' '}
                      {pad(end.getHours())}:{pad(end.getMinutes())}
                    </div>
                  )}
                  {height >= 48 && (
                    <div className="calendar-event-time">{r.room.name}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
