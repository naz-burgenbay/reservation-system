import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReservationItem } from '../types';

// Константы

const START_HOUR = 8;
const END_HOUR = 18;
const CELL_HEIGHT = 48; // пикселей на час

const HOURS: number[] = [];
for (let h = START_HOUR; h < END_HOUR; h++) {
  HOURS.push(h);
}

// Вспомогательные функции

function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  let diff: number;
  if (day === 0) {
    diff = -6; // Воскресенье: отступить на 6 дней назад до понедельника
  } else {
    diff = 1 - day; // Любой другой день: отступить до понедельника
  }
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

// Пропсы

interface WeeklyCalendarProps {
  events: ReservationItem[];
  loading?: boolean;
  error?: string | null;
  onWeekChange: (start: Date, end: Date) => void;
  onEventClick?: (event: ReservationItem) => void;
  onEventContextMenu?: (event: ReservationItem, x: number, y: number) => void;
}

// Компонент

export default function WeeklyCalendar({
  events,
  loading = false,
  error = null,
  onWeekChange,
  onEventClick,
  onEventContextMenu,
}: WeeklyCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'kz' ? 'kk-KZ' : 'ru-RU';

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekDays.push(d);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Уведомить родителя при смене недели
  useEffect(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    onWeekChange(weekStart, weekEnd);
  }, [weekStart, onWeekChange]);

  function prevWeek() {
    setWeekStart((current) => {
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 7);
      return prev;
    });
  }

  function nextWeek() {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  function goToday() {
    setWeekStart(getMonday(new Date()));
  }

  function getEventsForDay(day: Date) {
    return events.filter((r) => isSameDay(new Date(r.start_time), day));
  }

  const firstDay = weekDays[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const lastDay = weekDays[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const weekLabel = `${firstDay} – ${lastDay}`;

  const totalHeight = HOURS.length * CELL_HEIGHT;

  return (
    <div className="calendar">
      {/* Навигация */}
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

      {/* Статус */}
      {loading && (
        <p className="calendar-status calendar-status--loading">
          {t('reservations.loading')}
        </p>
      )}
      {error && (
        <p className="calendar-status calendar-status--error">{error}</p>
      )}

      {/* Заголовок: дни недели */}
      <div className="calendar-header">
        <div className="calendar-header-corner" />
        {weekDays.map((day, i) => {
          let headerClass = 'calendar-header-cell';
          if (isSameDay(day, today)) {
            headerClass += ' is-today';
          }
          return (
            <div key={i} className={headerClass}>
              <div>{day.toLocaleDateString(locale, { weekday: 'short' })}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 400, color: 'inherit' }}>
                {day.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Тело: колонка времени + колонки дней */}
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

              const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
              const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
              const eventTitle = `${r.title}\n${r.room.name} · ${r.room.building.name}\n${startTime} – ${endTime}`;

              return (
                <div
                  key={r.id}
                  className="calendar-event"
                  style={{ top: `${top}px`, height: `${height}px`, cursor: onEventClick ? 'pointer' : 'default' }}
                  title={eventTitle}
                  onClick={() => { if (onEventClick) { onEventClick(r); } }}
                  onContextMenu={(e) => {
                    if (onEventContextMenu) {
                      e.preventDefault();
                      onEventContextMenu(r, e.clientX, e.clientY);
                    }
                  }}
                >
                  <div className="calendar-event-title">{r.title}</div>
                  {height >= 32 && (
                    <div className="calendar-event-time">
                      {startTime} – {endTime}
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
