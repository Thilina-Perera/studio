'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useUser } from '@/hooks/use-user';

export default function BudgetTrackerPage() {
  const { clubs, expenses, loading } = useUser();

  const chartData = clubs.map((club) => {
    const clubExpenses = expenses.filter(
      (expense) => expense.clubId === club.id && expense.status === 'Approved'
    );
    const totalAmount = clubExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    return {
      club: club.name,
      total: totalAmount,
    };
  }).sort((a,b) => b.total - a.total);

  const chartConfig = {
    total: {
      label: 'Total Spent',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
          <CardDescription>
            Visualize approved spending across all clubs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading chart data...</p>
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="club"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 15)}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
             <p className="text-center text-muted-foreground py-8">No approved expenses to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
