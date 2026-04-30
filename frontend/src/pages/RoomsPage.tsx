import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DoorOpen } from 'lucide-react';
import { getRooms } from '../api/rooms';
import { useAuth } from '../context/AuthContext';
import type { Room } from '../types';
import '../i18n';

export default function RoomsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRooms()
      .then((res) => setRooms(res.data))
      .catch(() => setError(t('rooms.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page">
      <div className="page-calendar-wrapper">
        <div className="flex items-center justify-between">
          <h1 className="heading">{t('rooms.title')}</h1>
          {user?.role === 'admin' && (
            <Link to="/rooms/create" className="link">
              {t('rooms.create')}
            </Link>
          )}
        </div>

        <div className="card card--wide card--calendar">
          {loading && (
            <p className="calendar-status calendar-status--loading">
              {t('rooms.loading')}
            </p>
          )}
          {error && (
            <p className="calendar-status calendar-status--error">{error}</p>
          )}
          {!loading && !error && rooms.length === 0 && (
            <p className="calendar-status calendar-status--loading">
              {t('rooms.empty')}
            </p>
          )}
          {rooms.map((r) => (
            <Link key={r.id} to={`/rooms/${r.id}`} className="list-item">
              <DoorOpen size={20} color="var(--color-primary)" strokeWidth={2} />
              <div>
                <p className="list-item-name">{r.name}</p>
                <p className="list-item-meta">
                  {t('rooms.floor')} {r.floor} · {r.capacity} {t('rooms.seats')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
