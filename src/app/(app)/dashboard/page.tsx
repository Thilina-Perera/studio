import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { AiExpensePrioritization } from '@/components/dashboard/ai-expense-prioritization';
import { RepresentativeDashboard } from '@/components/dashboard/representative-dashboard';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function DashboardPage() {
  return (
    <Dashboard
      adminDashboard={
        <AdminDashboard>
          <AiExpensePrioritization />
        </AdminDashboard>
      }
      representativeDashboard={<RepresentativeDashboard />}
    />
  );
}
