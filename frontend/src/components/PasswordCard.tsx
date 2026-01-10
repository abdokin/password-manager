import type { Password } from '@/types';

interface PasswordCardProps {
  password: Password;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function PasswordCard({ password, onEdit, onDelete, onToggleFavorite }: PasswordCardProps) {
  const getStrengthColor = (score: number) => {
    if (score < 40) return '#dc3545';
    if (score < 60) return '#ffc107';
    if (score < 80) return '#17a2b8';
    return '#28a745';
  };

  const getStrengthLabel = (score: number) => {
    if (score < 40) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{password.name}</h3>
        <button
          onClick={onToggleFavorite}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: password.favorite ? '#ffc107' : '#ddd',
          }}
        >
          ★
        </button>
      </div>

      <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
        <div>Username: {password.username}</div>
        {password.url && <div>URL: <a href={password.url} target="_blank" rel="noopener noreferrer">{password.url}</a></div>}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Strength:</span>
          <span style={{ color: getStrengthColor(password.strength_score), fontWeight: 'bold' }}>
            {getStrengthLabel(password.strength_score)} ({password.strength_score})
          </span>
        </div>
      </div>

      {(password.is_breached || password.is_duplicate || password.is_weak) && (
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          {password.is_breached && <span style={{ color: '#dc3545', marginRight: '0.5rem' }}>⚠️ Breached</span>}
          {password.is_duplicate && <span style={{ color: '#ffc107', marginRight: '0.5rem' }}>⚠️ Duplicate</span>}
          {password.is_weak && <span style={{ color: '#dc3545', marginRight: '0.5rem' }}>⚠️ Weak</span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

