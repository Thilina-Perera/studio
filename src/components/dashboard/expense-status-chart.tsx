
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Expense } from '@/lib/types';
import { EXPENSE_STATUSES } from '@/lib/types';

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
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Expense Status Overview</CardTitle>
        <CardDescription>A summary of all expense statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
