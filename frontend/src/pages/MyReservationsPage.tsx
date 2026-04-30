import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import type { ReservationItem } from '../types';
import WeeklyCalendar from '../components/WeeklyCalendar';
import '../i18n';

export default function MyReservationsPage() {
  const { t } = useTranslation();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeekChange = useCallback((start: Date, end: Date) => {
    setLoading(true);
    setError(null);
    apiClient
      .get<ReservationItem[]>('/reservations/my/', {
        params: { start: start.toISOString(), end: end.toISOString() },
      })
      .then((res) => setReservations(res.data))
      .catch(() => setError(t('reservations.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page">
      <div className="page-calendar-wrapper">
        <h1 className="heading">{t('reservations.title')}</h1>
        <div className="card card--wide card--calendar">
          <div className="card-body">
            <WeeklyCalendar
              events={reservations}
              loading={loading}
              error={error}
              onWeekChange={handleWeekChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
