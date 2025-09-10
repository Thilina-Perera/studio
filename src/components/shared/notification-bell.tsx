'use client';

import { useNotifications } from '@/hooks/use-notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export function NotificationBell() {
  const { notifications, deleteNotification } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    } 
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-semibold border-b">Notifications</div>
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No new notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onSelect={() => deleteNotification(notification.id)}
              className={`border-b border-gray-200 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
              <div className="flex flex-col p-2">
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm text-gray-600">{notification.message}</div>
                <div className="text-xs text-gray-400 self-end">{formatDate(notification.createdAt)}</div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}