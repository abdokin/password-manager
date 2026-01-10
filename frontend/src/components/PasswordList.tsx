import { useState } from 'react';
import type { Password } from '@/types';
import PasswordCard from '@/components/PasswordCard';
import PasswordForm from '@/components/PasswordForm';
import { usePasswords, useCreatePassword, useUpdatePassword, useDeletePassword, useToggleFavorite } from '@/hooks/usePasswords';

export default function PasswordList() {
  const { data: passwords = [], isLoading } = usePasswords();
  const createPassword = useCreatePassword();
  const updatePassword = useUpdatePassword();
  const deletePassword = useDeletePassword();
  const toggleFavorite = useToggleFavorite();
  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  const handleCreate = async (passwordData: Partial<Password>) => {
    try {
      await createPassword.mutateAsync(passwordData);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create password:', error);
    }
  };

  const handleUpdate = async (id: number, passwordData: Partial<Password>) => {
    try {
      await updatePassword.mutateAsync({ id, data: passwordData });
      setEditingPassword(null);
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this password?')) {
      try {
        await deletePassword.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete password:', error);
      }
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await toggleFavorite.mutateAsync(id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Password Manager</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Password
        </button>
      </div>

      {showForm && (
        <PasswordForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPassword && (
        <PasswordForm
          password={editingPassword}
          onSubmit={(data) => handleUpdate(editingPassword.id, data)}
          onCancel={() => setEditingPassword(null)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {passwords.map((password) => (
          <PasswordCard
            key={password.id}
            password={password}
            onEdit={() => setEditingPassword(password)}
            onDelete={() => handleDelete(password.id)}
            onToggleFavorite={() => handleToggleFavorite(password.id)}
          />
        ))}
      </div>

      {passwords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No passwords yet. Click "Add Password" to get started.</p>
        </div>
      )}
    </div>
  );
}

