
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Expense } from '@/lib/types';
import { EXPENSE_STATUSES } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ExpenseStatusChartProps {
  allExpenses: Expense[];
}

const chartConfig = {
  Approved: {
    label: 'Approved',
    color: '#22c55e', // green-500
  },
  Pending: {
    label: 'Pending',
    color: '#facc15', // yellow-400
  },
  'Under Review': {
    label: 'Under Review',
    color: '#3b82f6', // blue-500
  },
  Rejected: {
    label: 'Rejected',
    color: '#ef4444', // red-500
  },
};

export function ExpenseStatusChart({ allExpenses }: ExpenseStatusChartProps) {
  const statusCounts = allExpenses.reduce((acc, expense) => {
    acc[expense.status] = (acc[expense.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = EXPENSE_STATUSES.map((status) => ({
    name: status,
    value: statusCounts[status] || 0,
    fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))',
  })).filter((d) => d.value > 0);

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Expense Status Overview</CardTitle>
        <CardDescription>A summary of all expense statuses.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-start gap-8 px-8">
        <div className="h-[150px] w-[150px] flex-shrink-0">
            <ChartContainer config={chartConfig} className='w-full h-full'>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: entry.fill }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
