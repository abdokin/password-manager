import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import type { Password } from '@/types';
import { passwordSchema, type PasswordFormData } from '@/schemas/password';
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';

interface PasswordFormProps {
  password?: Password | null;
  onSubmit: (data: Partial<Password>) => void;
  onCancel: () => void;
}

export default function PasswordForm({ password, onSubmit, onCancel }: PasswordFormProps) {
  const generatePassword = usePasswordGenerator();

  const form = useForm<PasswordFormData>({
    defaultValues: {
      name: password?.name || '',
      username: password?.username || '',
      password: password?.password || '',
      url: password?.url || '',
      notes: password?.notes || '',
      favorite: password?.favorite || false,
      expires_at: password?.expires_at || '',
      user_id: password?.user_id || 1,
      organization_id: password?.organization_id || 1,
      category_id: password?.category_id,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
    validator: zodValidator(passwordSchema),
  });

  const handleGenerate = async () => {
    const result = await generatePassword.mutateAsync({
      length: 16,
      include_uppercase: true,
      include_lowercase: true,
      include_numbers: true,
      include_symbols: true,
    });
    form.setFieldValue('password', result.password);
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
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
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

        <form.Field name="name">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Name *
              </label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="username">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Username *
              </label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
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
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="url">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                URL
              </label>
              <input
                type="url"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Notes
              </label>
              <textarea
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="favorite">
          {(field) => (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                Favorite
              </label>
            </div>
          )}
        </form.Field>

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
            disabled={form.state.isSubmitting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {form.state.isSubmitting ? 'Saving...' : password ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
