import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createReservation } from '../api/reservations';
import { getRooms } from '../api/rooms';
import type { Room } from '../types';
import '../i18n';

export default function CreateReservationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(searchParams.get('room') ?? '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRooms().then((res) => {
      setRooms(res.data);
      if (!roomId && res.data.length > 0) {
        setRoomId(res.data[0].id);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createReservation({
        room: roomId,
        title,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });
      navigate(`/rooms/${roomId}`, { replace: true });
    } catch (err) {
      type ErrorData = {
        detail?: string;
        title?: string[];
        room?: string[];
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
        } else if (data.room && data.room.length > 0) {
          message = data.room[0];
        } else if (data.start_time && data.start_time.length > 0) {
          message = data.start_time[0];
        } else if (data.end_time && data.end_time.length > 0) {
          message = data.end_time[0];
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
          <h1 className="heading">{t('reservations.create_title')}</h1>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
            <div>
              <label className="label">{t('reservations.room_label')}</label>
              <select
                className="input"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
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
            <button className="btn-primary" type="submit" disabled={loading}>
              {t('reservations.save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
