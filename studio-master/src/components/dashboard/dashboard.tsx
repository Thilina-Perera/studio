
'use client';
import { useUser } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps {
    adminDashboard: React.ReactNode;
    representativeDashboard: React.ReactNode;
    studentDashboard: React.ReactNode;
}

export function Dashboard({ adminDashboard, representativeDashboard, studentDashboard }: DashboardProps) {
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

  if (role === 'admin') return adminDashboard;
  if (role === 'representative') return representativeDashboard;
  if (role === 'student') return studentDashboard;

  return null;
}
