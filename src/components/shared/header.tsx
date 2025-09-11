'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user';
import { SidebarTrigger } from '../ui/sidebar';
import { LogOut } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { NotificationBell } from './notification-bell';

export function AppHeader() {
  const { user, logout } = useUser();
  
  if (!user) {
    return (
       <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
         <div className="md:hidden">
            <SidebarTrigger />
         </div>
         <div className="w-full flex-1" />
         <Skeleton className="h-10 w-10 rounded-full" />
       </header>
    )
  }

  const initials = user.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
       <div className="md:hidden">
         <SidebarTrigger />
       </div>
      <div className="w-full flex-1">
        {/* Can add a global search here if needed */}
      </div>
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
             <LogOut className="mr-2 h-4 w-4" />
             Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
