import { useState } from 'react';
import type { Password } from '@/types';
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';

interface PasswordFormProps {
  password?: Password | null;
  onSubmit: (data: Partial<Password>) => void;
  onCancel: () => void;
}

export default function PasswordForm({ password, onSubmit, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    name: password?.name || '',
    username: password?.username || '',
    password: password?.password || '',
    url: password?.url || '',
    notes: password?.notes || '',
    favorite: password?.favorite || false,
    expires_at: password?.expires_at || '',
    user_id: password?.user_id || 1,
    organization_id: password?.organization_id || 1,
    category_id: password?.category_id || undefined,
  });

  const generatePassword = usePasswordGenerator();

  const handleGenerate = async () => {
    const result = await generatePassword.mutateAsync({
      length: 16,
      include_uppercase: true,
      include_lowercase: true,
      include_numbers: true,
      include_symbols: true,
    });
    setFormData({ ...formData, password: result.password });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>{password ? 'Edit Password' : 'Add Password'}</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password *
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generatePassword.isPending}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Generate
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.favorite}
              onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
            />
            Favorite
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {password ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

