import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRoom, getRoomReservations } from '../api/rooms';
import { cancelReservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import type { Room, ReservationItem } from '../types';
import WeeklyCalendar from '../components/WeeklyCalendar';
import ReservationContextMenu from '../components/ReservationContextMenu';
import '../i18n';

export default function RoomReservationsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ event: ReservationItem; x: number; y: number } | null>(null);
  const [lastRange, setLastRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (!id) return;
    getRoom(id)
      .then((res) => setRoom(res.data))
      .catch(() => {});
  }, [id]);

  const handleWeekChange = useCallback(async (start: Date, end: Date) => {
    if (!id) return;
    setLastRange({ start, end });
    setLoading(true);
    setError(null);
    try {
      const res = await getRoomReservations(id, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
      setReservations(res.data);
    } catch {
      setError(t('reservations.error'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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
    if (!contextMenu || !id) return;
    setContextMenu(null);
    try {
      await cancelReservation(contextMenu.event.id);
      if (lastRange) {
        const res = await getRoomReservations(id, {
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
          <div>
            <Link
              to={room ? `/buildings/${room.building}` : '/rooms'}
              className="link"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              ← {t('rooms.title')}
            </Link>
            <h1 className="heading" style={{ marginTop: '0.25rem' }}>
              {room ? room.name : '...'}
            </h1>
            {room && (
              <p className="subheading" style={{ marginTop: 0 }}>
                {t('rooms.floor')} {room.floor} · {room.capacity} {t('rooms.seats')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/reservations/create?room=${id}`} className="link">
              {t('reservations.create')}
            </Link>
            {user?.role === 'admin' && (
              <>
                <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>|</span>
                <Link to={`/rooms/${id}/edit`} className="link">
                  {t('common.edit')}
                </Link>
              </>
            )}
          </div>
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
