import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck } from 'lucide-react';

interface NotificationsProps {
  organizationId?: number;
}

export default function Notifications({ organizationId }: NotificationsProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', organizationId],
    queryFn: () => api.notifications.list(organizationId, true),
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your account activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications ({unreadCount} unread)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                  notification.read_at ? 'bg-muted/50' : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.read_at && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                {!notification.read_at && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(notification.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notifications yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

