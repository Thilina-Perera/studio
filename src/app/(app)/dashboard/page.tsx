import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { AiExpensePrioritization } from '@/components/dashboard/ai-expense-prioritization';
import { RepresentativeDashboard } from '@/components/dashboard/representative-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function DashboardPage() {
  return (
    <Dashboard
      adminDashboard={
        <AdminDashboard>
          {/* @ts-expect-error Server Component */}
          <AiExpensePrioritization />
        </AdminDashboard>
      }
      representativeDashboard={<RepresentativeDashboard />}
      studentDashboard={<StudentDashboard />}
    />
  );
}
