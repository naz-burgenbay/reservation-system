import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createRoom, getBuildings } from '../api/rooms';
import type { Building } from '../types';
import '../i18n';

export default function CreateRoomPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [floor, setFloor] = useState('0');
  const [capacity, setCapacity] = useState('1');
  const [buildingId, setBuildingId] = useState(searchParams.get('building') ?? '');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBuildings().then((res) => {
      setBuildings(res.data);
      if (!buildingId && res.data.length > 0) {
        setBuildingId(res.data[0].id);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createRoom({
        name,
        building: buildingId,
        floor: Number(floor),
        capacity: Number(capacity),
      });
      navigate('/rooms', { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        data?.detail ??
          data?.name?.[0] ??
          data?.floor?.[0] ??
          data?.capacity?.[0] ??
          data?.building?.[0] ??
          t('rooms.save_error'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h1 className="heading">{t('rooms.create_title')}</h1>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
            <div>
              <label className="label">{t('buildings.title')}</label>
              <select
                className="input"
                required
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('rooms.name')}</label>
              <input
                className="input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('rooms.floor')}</label>
              <input
                className="input"
                type="number"
                min="0"
                required
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('rooms.capacity')}</label>
              <input
                className="input"
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {t('rooms.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
