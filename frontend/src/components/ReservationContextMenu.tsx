import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ReservationContextMenuProps {
  x: number;
  y: number;
  onCancel: () => void;
  onClose: () => void;
}

export default function ReservationContextMenu({
  x,
  y,
  onCancel,
  onClose,
}: ReservationContextMenuProps) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside() {
      onClose();
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 1000,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        minWidth: '10rem',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onCancel}
        style={{
          display: 'block',
          width: '100%',
          padding: '0.6rem 1rem',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          color: '#dc2626',
        }}
      >
        {t('reservations.cancel')}
      </button>
    </div>
  );
}
