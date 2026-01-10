import { useState, useEffect } from 'react';
import { useActionCable } from '@/hooks/useActionCable';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationBell() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Get token from localStorage or API
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
  const { messages } = useActionCable(apiUrl, 'NotificationsChannel', token || undefined);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(undefined, true),
    enabled: !!token,
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Process WebSocket messages
  useEffect(() => {
    messages.forEach((message) => {
      if (message.type === 'notification') {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    });
  }, [messages, queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.read_at).length;
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              recentNotifications.map((notification: any) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer hover:bg-accent transition-colors ${
                    !notification.read_at ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsRead.mutate(notification.id);
                    }
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getNotificationIcon(notification.notification_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.read_at && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {notifications.length > 5 && (
            <div className="mt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/notifications'}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

