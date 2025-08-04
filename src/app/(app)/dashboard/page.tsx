'use client';

import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { AiExpensePrioritization } from '@/components/dashboard/ai-expense-prioritization';
import { RepresentativeDashboard } from '@/components/dashboard/representative-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useUser } from '@/hooks/use-user';

export default function DashboardPage() {
  const { expenses, clubs } = useUser();
  return (
    <Dashboard
      adminDashboard={
        <AdminDashboard>
          {/* @ts-expect-error Server Component */}
          <AiExpensePrioritization expenses={expenses} clubs={clubs} />
        </AdminDashboard>
      }
      representativeDashboard={<RepresentativeDashboard />}
      studentDashboard={<StudentDashboard />}
    />
  );
}
