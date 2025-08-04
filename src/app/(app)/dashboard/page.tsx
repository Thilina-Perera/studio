'use client';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { RepresentativeDashboard } from '@/components/dashboard/representative-dashboard';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, role } = useUser();

  if (!user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return role === 'admin' ? <AdminDashboard /> : <RepresentativeDashboard />;
}
