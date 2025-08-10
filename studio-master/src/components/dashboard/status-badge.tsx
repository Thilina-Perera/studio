import { Badge } from '@/components/ui/badge';
import type { ExpenseStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ExpenseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = {
    Pending: 'default',
    'Under Review': 'secondary',
    Approved: 'outline',
    Rejected: 'destructive',
  }[status];

  const className = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  }[status];
  
  return <Badge variant={'outline'} className={cn('font-normal', className)}>{status}</Badge>;
}
