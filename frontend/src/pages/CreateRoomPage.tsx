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
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    } catch (err) {
      type ErrorData = { detail?: string; name?: string[]; floor?: string[]; capacity?: string[]; building?: string[] };
      const response = (err as { response?: { data?: ErrorData } }).response;
      const data = response?.data;
      let message = t('rooms.save_error');
      if (data) {
        if (data.detail) {
          message = data.detail;
        } else if (data.name && data.name.length > 0) {
          message = data.name[0];
        } else if (data.floor && data.floor.length > 0) {
          message = data.floor[0];
        } else if (data.capacity && data.capacity.length > 0) {
          message = data.capacity[0];
        } else if (data.building && data.building.length > 0) {
          message = data.building[0];
        }
      }
      setError(message);
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
