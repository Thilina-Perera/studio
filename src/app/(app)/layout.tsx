'use client';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { AppHeader } from '@/components/shared/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
