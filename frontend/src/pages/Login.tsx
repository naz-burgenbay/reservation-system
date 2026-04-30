
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../i18n';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/reservations', { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail
        ?? err?.response?.data?.non_field_errors?.[0]
        ?? t('login.error');
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-bg">
        <img src="/bg-login.png" alt="Background" />
      </div>
      <div className="card">
        <div className="card-header">
          <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <div className="inline-flex rounded-lg border border-border-medium bg-gray-50/80 p-0.5 text-sm font-semibold shadow-sm" role="group" aria-label="Қаз / Рус">
              <button
                type="button"
                className={`px-2.5 py-1 rounded-md transition-colors ${i18n.language === 'kz' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={() => i18n.changeLanguage('kz')}
              >
                Қаз
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded-md transition-colors ${i18n.language === 'ru' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={() => i18n.changeLanguage('ru')}
              >
                Рус
              </button>
            </div>
          </div>
          <h1 className="heading">ЭНД</h1>
          <p className="subheading">{t('company.name')}</p>
        </div>
        <div className="card-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: '#dc2626', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
            )}
            <div>
              <label className="label">{t('login.email')}</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input
                  className="input"
                  placeholder={t('login.email')}
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">{t('login.password')}</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  className="input has-icon-right"
                  placeholder={t('login.password')}
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {t('login.button')}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              {t('login.no_account')}{' '}
              <Link to="/register" className="link">{t('login.register')}</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
