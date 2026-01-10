import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin_users', search, roleFilter],
    queryFn: () => api.admin.users.list({ search, role: roleFilter !== 'all' ? roleFilter : undefined }),
  });

  const toggleRole = useMutation({
    mutationFn: (userId: number) => api.admin.users.toggleRole(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: number) => api.admin.users.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  const users = data?.users || [];
  const stats = data || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Total: {stats.total || 0} | Admins: {stats.admins || 0} | Regular: {stats.regular_users || 0}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.role === 'admin' || user.role === 'super_admin' ? (
                    <Shield className="w-5 h-5 text-blue-500" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.organizations_count} orgs • {user.passwords_count} passwords
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'admin' || user.role === 'super_admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role || 'user'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRole.mutate(user.id)}
                >
                  {user.role === 'admin' || user.role === 'super_admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete user ${user.email}?`)) {
                      deleteUser.mutate(user.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

