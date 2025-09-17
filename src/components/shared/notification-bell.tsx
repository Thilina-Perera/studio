'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export function NotificationBell() {
  const { user, notifications, loading, markNotificationAsRead } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    // 1. Optimistically mark the notification as read, which will instantly remove it from the UI.
    markNotificationAsRead(notification.id);

    // 2. Immediately close the popover for a clean UX.
    setIsOpen(false);

    // 3. Navigate to the notification's link.
    router.push(notification.link);
  };
  
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          Notifications
        </div>
        <ScrollArea className="h-96">
            {loading ? (
                <div className="text-center text-muted-foreground p-8">
                    Loading...
                </div>
            ) : unreadNotifications.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                    You have no new notifications.
                </div>
            ) : (
                <div className="divide-y">
                    {unreadNotifications.map(notification => (
                        <div 
                           key={notification.id} 
                           className="block p-4 hover:bg-muted/50 cursor-pointer" 
                           onClick={() => handleNotificationClick(notification)}
                        >
                           <div className="flex items-start gap-3">
                               <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                               <div className={cn("flex-1 space-y-1")}>
                                   <p className="text-sm">{notification.message}</p>
                                   <p className="text-xs text-muted-foreground">
                                       {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                   </p>
                               </div>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
