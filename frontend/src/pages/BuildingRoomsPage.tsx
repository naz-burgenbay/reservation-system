import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DoorOpen } from 'lucide-react';
import { getBuilding, getBuildingRooms } from '../api/rooms';
import { useAuth } from '../context/AuthContext';
import type { Building, Room } from '../types';
import '../i18n';

export default function BuildingRoomsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [building, setBuilding] = useState<Building | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const buildingRequest = getBuilding(id);
    const roomsRequest = getBuildingRooms(id);

    Promise.all([buildingRequest, roomsRequest])
      .then(([buildingRes, roomsRes]) => {
        setBuilding(buildingRes.data);
        setRooms(roomsRes.data);
      })
      .catch(() => setError(t('rooms.error')))
      .finally(() => setLoading(false));
  }, [id, t]);

  return (
    <div className="page">
      <div className="page-calendar-wrapper">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/buildings" className="link" style={{ fontSize: 'var(--text-sm)' }}>
              ← {t('buildings.title')}
            </Link>
            <h1 className="heading" style={{ marginTop: '0.25rem' }}>
              {building ? building.name : '...'}
            </h1>
            {building && building.address && (
              <p className="subheading" style={{ marginTop: 0 }}>{building.address}</p>
            )}
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3">
              <Link to={`/rooms/create?building=${id}`} className="link">
                {t('rooms.create')}
              </Link>
              <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>|</span>
              <Link to={`/buildings/${id}/edit`} className="link">
                {t('common.edit')}
              </Link>
            </div>
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
            <div key={r.id} className="list-item">
              <Link to={`/rooms/${r.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <DoorOpen size={20} color="var(--color-primary)" strokeWidth={2} />
                <div>
                  <p className="list-item-name">{r.name}</p>
                  <p className="list-item-meta">
                    {t('rooms.floor')} {r.floor} · {r.capacity} {t('rooms.seats')}
                  </p>
                </div>
              </Link>
              {user?.role === 'admin' && (
                <Link to={`/rooms/${r.id}/edit`} className="link" style={{ flexShrink: 0 }}>
                  {t('common.edit')}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
