import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReservation, updateReservation, cancelReservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import type { Reservation } from '../types';
import '../i18n';

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditReservationPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getReservation(id)
      .then((res) => {
        const r = res.data;
        setReservation(r);
        setTitle(r.title);
        setStartTime(toDatetimeLocal(r.start_time));
        setEndTime(toDatetimeLocal(r.end_time));
      })
      .catch(() => setError(t('reservations.load_error')))
      .finally(() => setLoading(false));
  }, [id, t]);

  const isOwner = user !== null && reservation !== null && user.id === reservation.user;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setSaving(true);
    try {
      await updateReservation(id, {
        title,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });
      navigate(-1);
    } catch (err) {
      type ErrorData = {
        detail?: string;
        title?: string[];
        start_time?: string[];
        end_time?: string[];
        non_field_errors?: string[];
      };
      const response = (err as { response?: { data?: ErrorData } }).response;
      const data = response?.data;
      let message = t('reservations.save_error');
      if (data) {
        if (data.detail) {
          message = data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length > 0) {
          message = data.non_field_errors[0];
        } else if (data.title && data.title.length > 0) {
          message = data.title[0];
        } else if (data.start_time && data.start_time.length > 0) {
          message = data.start_time[0];
        } else if (data.end_time && data.end_time.length > 0) {
          message = data.end_time[0];
        }
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    setSaving(true);
    try {
      await cancelReservation(id);
      navigate(-1);
    } catch {
      setError(t('reservations.cancel_error'));
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-body">
            <p className="calendar-status calendar-status--loading">{t('reservations.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-body">
            <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)' }}>{t('reservations.not_owner')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h1 className="heading">{t('reservations.edit_title')}</h1>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
            <div>
              <label className="label">{t('reservations.title_label')}</label>
              <input
                className="input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('reservations.start_time')}</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="label">{t('reservations.end_time')}</label>
              <input
                className="input"
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-primary" type="submit" disabled={saving}>
                {t('reservations.save')}
              </button>
              <button
                className="btn-secondary"
                type="button"
                disabled={saving}
                onClick={handleCancel}
                style={{ color: '#dc2626', borderColor: '#dc2626' }}
              >
                {t('reservations.cancel_reservation')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
