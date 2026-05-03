import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../i18n';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <span className="navbar-logo">{t('company.name')}</span>

      <div className="flex items-center gap-1 flex-1">
        <NavLink
          to="/reservations"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {t('nav.reservations')}
        </NavLink>
        <NavLink
          to="/buildings"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {t('nav.buildings')}
        </NavLink>
        <NavLink
          to="/rooms"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {t('nav.rooms')}
        </NavLink>
        {user?.role === 'admin' && (
          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            {t('nav.admin')}
          </a>
        )}
      </div>

      <div className="flex items-center">
        <button
          type="button"
          className={`navbar-lang-btn${i18n.language === 'kz' ? ' is-active' : ''}`}
          onClick={() => i18n.changeLanguage('kz')}
        >
          Қаз
        </button>
        <span style={{ color: 'rgba(255,255,255,0.35)', userSelect: 'none', padding: '0 0.125rem' }}>|</span>
        <button
          type="button"
          className={`navbar-lang-btn${i18n.language === 'ru' ? ' is-active' : ''}`}
          onClick={() => i18n.changeLanguage('ru')}
        >
          Рус
        </button>
      </div>

      <button type="button" className="nav-link" onClick={handleLogout}>
        {t('nav.logout')}
      </button>
    </nav>
  );
}
