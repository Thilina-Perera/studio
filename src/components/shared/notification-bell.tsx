
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

export function NotificationBell() {
  const { user, notifications } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark all as read when popover is opened
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) => {
          const notifRef = doc(db, 'notifications', n.id);
          return updateDoc(notifRef, { isRead: true });
        })
      );
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          Notifications
        </div>
        <ScrollArea className="h-96">
            {notifications.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                    You have no notifications.
                </div>
            ) : (
                <div className="divide-y">
                    {notifications.map(notification => (
                        <Link href={notification.link} key={notification.id} passHref legacyBehavior>
                           <a className="block p-4 hover:bg-muted/50" onClick={() => setIsOpen(false)}>
                                <div className="flex items-start gap-3">
                                    {!notification.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    )}
                                    <div className={cn("flex-1 space-y-1", notification.isRead && "pl-5")}>
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
