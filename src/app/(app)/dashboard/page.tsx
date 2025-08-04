'use client';

import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { RepresentativeDashboard } from '@/components/dashboard/representative-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const { user, clubs, expenses } = useUser();
  return (
    <Dashboard
      adminDashboard={<AdminDashboard allClubs={clubs} allExpenses={expenses} />}
      representativeDashboard={<RepresentativeDashboard allClubs={clubs} allExpenses={expenses} />}
      studentDashboard={<StudentDashboard allClubs={clubs} allExpenses={expenses} />}
    />
  );
}
