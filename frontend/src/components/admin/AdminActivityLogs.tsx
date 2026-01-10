import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Activity, Clock } from 'lucide-react';

export default function AdminActivityLogs() {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin_activity_logs', search],
    queryFn: () => api.admin.getActivityLogs({ search }),
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading activity logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Recent system activity and events</CardDescription>
          </div>
          <Input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{log.action}</div>
                {log.details && (
                  <div className="text-sm text-muted-foreground mt-1">{log.details}</div>
                )}
                {log.organization_name && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Organization: {log.organization_name}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

