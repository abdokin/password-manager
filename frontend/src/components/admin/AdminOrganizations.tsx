import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Users, Lock, Trash2 } from 'lucide-react';

export default function AdminOrganizations() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin_organizations', search],
    queryFn: () => api.admin.organizations.list({ search }),
  });

  const deleteOrg = useMutation({
    mutationFn: (orgId: number) => api.admin.organizations.delete(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_organizations'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading organizations...</div>;
  }

  const organizations = data?.organizations || [];
  const stats = data || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>
              Total: {stats.total || 0} | Active Subscriptions: {stats.active_subscriptions || 0}
            </CardDescription>
          </div>
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {organizations.map((org: any) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {org.members_count} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        {org.passwords_count} passwords
                      </span>
                    </span>
                  </div>
                  {org.subscription && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Plan: {org.subscription.plan} ({org.subscription.status})
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {org.subscription && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    org.subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {org.subscription.status}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Delete organization ${org.name}?`)) {
                      deleteOrg.mutate(org.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {organizations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No organizations found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

