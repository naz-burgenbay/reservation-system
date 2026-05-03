import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createBuilding } from '../api/rooms';
import '../i18n';

export default function CreateBuildingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createBuilding({ name, address });
      navigate('/buildings', { replace: true });
    } catch (err) {
      type ErrorData = { detail?: string; name?: string[]; address?: string[] };
      const response = (err as { response?: { data?: ErrorData } }).response;
      const data = response?.data;
      let message = t('buildings.save_error');
      if (data) {
        if (data.detail) {
          message = data.detail;
        } else if (data.name && data.name.length > 0) {
          message = data.name[0];
        } else if (data.address && data.address.length > 0) {
          message = data.address[0];
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
          <h1 className="heading">{t('buildings.create_title')}</h1>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
            <div>
              <label className="label">{t('buildings.name')}</label>
              <input
                className="input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('buildings.address')}</label>
              <input
                className="input"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {t('buildings.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
