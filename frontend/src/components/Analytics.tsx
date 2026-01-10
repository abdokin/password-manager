import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Lock, Server, BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  organizationId: number;
}

export default function Analytics({ organizationId }: AnalyticsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', organizationId],
    queryFn: () => api.analytics.getUsage(organizationId),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const analytics = data || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track usage and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.passwords?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users?.active || 0}</div>
            <p className="text-xs text-muted-foreground">of {analytics.users?.total || 0} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environments</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.environments?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{analytics.environments?.variables || 0} variables</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Trend</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(analytics.passwords?.created || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">Days with activity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Statistics
          </CardTitle>
          <CardDescription>Detailed usage metrics for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Password Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-2xl font-bold">
                    {Object.values(analytics.passwords?.created || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Used</div>
                  <div className="text-2xl font-bold">
                    {Object.values(analytics.passwords?.used || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

