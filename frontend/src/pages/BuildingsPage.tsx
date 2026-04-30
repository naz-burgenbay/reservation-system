import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { getBuildings } from '../api/rooms';
import { useAuth } from '../context/AuthContext';
import type { Building } from '../types';
import '../i18n';

export default function BuildingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBuildings()
      .then((res) => setBuildings(res.data))
      .catch(() => setError(t('buildings.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page">
      <div className="page-calendar-wrapper">
        <div className="flex items-center justify-between">
          <h1 className="heading">{t('buildings.title')}</h1>
          {user?.role === 'admin' && (
            <Link to="/buildings/create" className="link">
              {t('buildings.create')}
            </Link>
          )}
        </div>

        <div className="card card--wide card--calendar">
          {loading && (
            <p className="calendar-status calendar-status--loading">
              {t('buildings.loading')}
            </p>
          )}
          {error && (
            <p className="calendar-status calendar-status--error">{error}</p>
          )}
          {!loading && !error && buildings.length === 0 && (
            <p className="calendar-status calendar-status--loading">
              {t('buildings.empty')}
            </p>
          )}
          {buildings.map((b) => (
            <div key={b.id} className="list-item">
              <Link to={`/buildings/${b.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Building2 size={20} color="var(--color-primary)" strokeWidth={2} />
                <div>
                  <p className="list-item-name">{b.name}</p>
                  {b.address && <p className="list-item-meta">{b.address}</p>}
                </div>
              </Link>
              {user?.role === 'admin' && (
                <Link to={`/buildings/${b.id}/edit`} className="link" style={{ flexShrink: 0 }}>
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
