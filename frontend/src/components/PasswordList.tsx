import { useState } from 'react';
import type { Password } from '@/types';
import PasswordCard from '@/components/PasswordCard';
import PasswordForm from '@/components/PasswordForm';
import SearchBar from '@/components/SearchBar';
import ImportExport from '@/components/ImportExport';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePasswords, useCreatePassword, useUpdatePassword, useDeletePassword, useToggleFavorite } from '@/hooks/usePasswords';
import { useSearch } from '@/hooks/useSearch';

export default function PasswordList() {
  const { data: passwords = [], isLoading } = usePasswords();
  const createPassword = useCreatePassword();
  const updatePassword = useUpdatePassword();
  const deletePassword = useDeletePassword();
  const toggleFavorite = useToggleFavorite();
  const [showForm, setShowForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [selectedOrgId] = useState(1);

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    filteredPasswords,
  } = useSearch(passwords);

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
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Password Manager</h1>
          <p className="text-muted-foreground mt-1">Securely manage your passwords and credentials</p>
        </div>
        <div className="flex gap-2">
          <ImportExport organizationId={selectedOrgId} />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Password
          </Button>
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredPasswords.length} of {passwords.length} passwords
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPasswords.map((password) => (
          <PasswordCard
            key={password.id}
            password={password}
            onEdit={() => setEditingPassword(password)}
            onDelete={() => handleDelete(password.id)}
            onToggleFavorite={() => handleToggleFavorite(password.id)}
          />
        ))}
      </div>

      {filteredPasswords.length === 0 && passwords.length > 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No passwords match your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {passwords.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No passwords yet</h3>
              <p className="text-muted-foreground mb-4">Click "Add Password" to get started.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
