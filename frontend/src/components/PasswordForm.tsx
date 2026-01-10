import { useForm } from '@tanstack/react-form';
import type { Password } from '@/types';
import type { PasswordFormData } from '@/schemas/password';
import { usePasswordGenerator } from '@/hooks/usePasswordGenerator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{password ? 'Edit Password' : 'Add Password'}</DialogTitle>
          <DialogDescription>
            {password ? 'Update password details' : 'Add a new password to your vault'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="username">
            {(field) => (
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleGenerate} disabled={generatePassword.isPending}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${generatePassword.isPending ? 'animate-spin' : ''}`} />
                    Generate
                  </Button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="url">
            {(field) => (
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://example.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            )}
          </form.Field>

          <form.Field name="favorite">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="favorite" className="cursor-pointer">
                  Mark as favorite
                </Label>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Saving...' : password ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
