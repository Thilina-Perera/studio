
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export function NotificationBell() {
  const { user, notifications } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

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
            {unreadNotifications.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                    You have no new notifications.
                </div>
            ) : (
                <div className="divide-y">
                    {unreadNotifications.map(notification => (
                        <Link href={notification.link} key={notification.id} passHref legacyBehavior>
                           <a 
                                className="block p-4 hover:bg-muted/50" 
                                onClick={() => {
                                    handleMarkAsRead(notification.id);
                                    setIsOpen(false);
                                }}
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
                            </a>
                        </Link>
                    ))}
                </div>
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
