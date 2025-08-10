'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from '../ui/sidebar';
import { Logo } from '../logo';
import { useUser } from '@/hooks/use-user';
import { LayoutDashboard, Users, CreditCard, LogOut, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Approvals', icon: CheckSquare },
];

const repNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'My Expenses', icon: CreditCard },
  { href: '/clubs', label: 'My Clubs', icon: Users },
];

const studentNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/expenses', label: 'My Expenses', icon: CreditCard },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { role, logout } = useUser();
  
  let navItems;
  switch (role) {
    case 'admin':
        navItems = adminNav;
        break;
    case 'representative':
        navItems = repNav;
        break;
    case 'student':
        navItems = studentNav;
        break;
    default:
        navItems = [];
  }

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
