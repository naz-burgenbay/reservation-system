import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyReservations, cancelReservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import type { ReservationItem } from '../types';
import WeeklyCalendar from '../components/WeeklyCalendar';
import ReservationContextMenu from '../components/ReservationContextMenu';
import '../i18n';

export default function MyReservationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ event: ReservationItem; x: number; y: number } | null>(null);
  const [lastRange, setLastRange] = useState<{ start: Date; end: Date } | null>(null);

  const handleWeekChange = useCallback(async (start: Date, end: Date) => {
    setLastRange({ start, end });
    setLoading(true);
    setError(null);
    try {
      const res = await getMyReservations({ start: start.toISOString(), end: end.toISOString() });
      setReservations(res.data);
    } catch {
      setError(t('reservations.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  function handleEventClick(ev: ReservationItem) {
    navigate(`/reservations/${ev.id}/edit`);
  }

  function handleEventContextMenu(ev: ReservationItem, x: number, y: number) {
    const isOwner = user !== null && ev.user === user.id;
    const isAdmin = user?.role === 'admin';
    if (isOwner || isAdmin) {
      setContextMenu({ event: ev, x, y });
    }
  }

  async function handleContextCancel() {
    if (!contextMenu) return;
    setContextMenu(null);
    try {
      await cancelReservation(contextMenu.event.id);
      if (lastRange) {
        const res = await getMyReservations({
          start: lastRange.start.toISOString(),
          end: lastRange.end.toISOString(),
        });
        setReservations(res.data);
      }
    } catch {
      setError(t('reservations.cancel_error'));
    }
  }

  return (
    <div className="page">
      <div className="page-calendar-wrapper">
        <div className="flex items-center justify-between">
          <h1 className="heading">{t('reservations.title')}</h1>
          <Link to="/buildings" className="link">{t('reservations.create')}</Link>
        </div>
        <div className="card card--wide card--calendar">
          <div className="card-body">
            <WeeklyCalendar
              events={reservations}
              loading={loading}
              error={error}
              onWeekChange={handleWeekChange}
              onEventClick={handleEventClick}
              onEventContextMenu={handleEventContextMenu}
            />
          </div>
        </div>
      </div>
      {contextMenu && (
        <ReservationContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCancel={handleContextCancel}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
