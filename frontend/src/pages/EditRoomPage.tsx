import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRoom, updateRoom } from '../api/rooms';
import '../i18n';

export default function EditRoomPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [floor, setFloor] = useState('0');
  const [capacity, setCapacity] = useState('1');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRoom(id)
      .then((res) => {
        setName(res.data.name);
        setFloor(String(res.data.floor));
        setCapacity(String(res.data.capacity));
      })
      .catch(() => setLoadError(t('rooms.error')));
  }, [id, t]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      await updateRoom(id, { name, floor: Number(floor), capacity: Number(capacity) });
      navigate('/rooms', { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        data?.detail ??
          data?.name?.[0] ??
          data?.floor?.[0] ??
          data?.capacity?.[0] ??
          t('rooms.save_error'),
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadError) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-body">
            <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h1 className="heading">{t('rooms.edit_title')}</h1>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
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
