
'use client';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { AppHeader } from '@/components/shared/header';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function AppLayoutSkeleton() {
    return (
        <div className="flex min-h-screen">
            <div className="hidden md:block border-r">
                <div className="w-64 h-full p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            </div>
            <div className="flex-1">
                 <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                    <div className="md:hidden">
                        <Skeleton className="h-8 w-8" />
                    </div>
                    <div className="w-full flex-1" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </header>
                <main className="p-8">
                    <Skeleton className="h-8 w-1/3 mb-8" />
                    <Skeleton className="h-96 w-full" />
                </main>
            </div>
        </div>
    )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not loading and there's no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Show skeleton while loading user auth state OR if there is no user yet
  // This is the gatekeeper for all authenticated routes
  if (loading || !user) {
    return <AppLayoutSkeleton />;
  }
  
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
