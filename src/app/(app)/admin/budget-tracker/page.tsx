'use client';
import React, { useState, useMemo } from 'react';
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
import { getBudgetRecommendations } from '@/ai/flows/budget-recommendations';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function AiRecommendations({ chartData }: { chartData: any[] }) {
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations('');
    try {
      const result = await getBudgetRecommendations(chartData.map(d => ({ clubName: d.club, totalSpent: d.total })));
      setRecommendations(result);
    } catch (e: any) {
      console.error("Error getting recommendations:", e);
      setError(e.message || "An unknown error occurred while generating recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
            <CardTitle>AI Budget Advisor</CardTitle>
            <CardDescription>
                Get AI-powered recommendations based on club spending.
            </CardDescription>
        </div>
        <Button onClick={handleGetRecommendations} disabled={loading}>
          {loading ? 'Analyzing...' : <><Sparkles className="mr-2 h-4 w-4" /> Get AI Recommendations</>}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-1/3 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && (
            <div className="flex items-center gap-4 rounded-lg border border-destructive bg-destructive/10 p-4">
               <AlertTriangle className="h-6 w-6 text-destructive" />
               <div className="space-y-1">
                 <p className="font-semibold text-destructive">Analysis Failed</p>
                 <p className="text-sm text-destructive/80">{error}</p>
               </div>
            </div>
        )}
        {recommendations && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: recommendations.replace(/\n/g, '<br />') }}
          />
        )}
         {!loading && !error && !recommendations && (
            <p className="text-center text-muted-foreground py-8">
                Click the button to generate budget recommendations.
            </p>
        )}
      </CardContent>
    </Card>
  );
}


export default function BudgetTrackerPage() {
  const { clubs, expenses, loading } = useUser();

  const chartData = useMemo(() => {
    return clubs.map((club) => {
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
  }, [clubs, expenses]);


  const chartConfig = {
    total: {
      label: 'Total Spent',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="space-y-8">
       <div className="space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">Budget Tracker</h1>
         <p className="text-muted-foreground">
            Visualize approved spending and get AI-powered budget insights.
         </p>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Spending Overview</CardTitle>
          <CardDescription>
            A visual breakdown of approved spending across all clubs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
                <p>Loading chart data...</p>
            </div>
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
             <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-center text-muted-foreground">No approved expenses to display.</p>
             </div>
          )}
        </CardContent>
      </Card>
      
      <AiRecommendations chartData={chartData} />

    </div>
  );
}
