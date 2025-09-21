
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
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useUser } from '@/hooks/use-user';
import { getBudgetRecommendations } from '@/ai/flows/budget-recommendations';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, PieChart, Sparkles, Users, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '@/lib/types';
import { useTheme } from 'next-themes';


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
      if (!result) {
        throw new Error("The AI returned an empty response. Please try again when more data is available.");
      }
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
            <CardTitle>AI Expense Advisor</CardTitle>
            <CardDescription>
                Get AI-powered recommendations based on club spending.
            </CardDescription>
        </div>
        <Button onClick={handleGetRecommendations} disabled={loading} className="animate-glow">
          {loading ? 'Analyzing...' : <><Sparkles className="mr-2 h-4 w-4" /> Get AI Insights</>}
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
                Click the button to generate expense recommendations.
            </p>
        )}
      </CardContent>
    </Card>
  );
}

const CATEGORY_COLORS: { [key in ExpenseCategory]: string } = {
    'Food & Beverage': '#3b82f6', // blue-500
    'Stationary': '#10b981', // green-500
    'Event Materials': '#f97316', // orange-500
    'Transport': '#ec4899', // pink-500
    'Venue': '#8b5cf6', // violet-500
    'Subscriptions': '#6366f1', // indigo-500
    'Advertising': '#f59e0b', // amber-500
    'Entertainment': '#d946ef', // fuchsia-500
    'Other': '#6b7280', // gray-500
  };
  

export default function BudgetTrackerPage() {
  const { theme } = useTheme();
  const { clubs, expenses, loading } = useUser();
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedClub, setSelectedClub] = useState<any | null>(null);

  const approvedExpenses = useMemo(() => {
    return expenses.filter(expense => expense.status === 'Approved');
  }, [expenses]);

  const { chartData, totalSpending, activeClubsCount, averageExpense } = useMemo(() => {
    const data = clubs.map((club) => {
      const clubExpenses = approvedExpenses.filter(
        (expense) => expense.clubId === club.id
      );

      const categorySpending = clubExpenses.reduce((acc, expense) => {
        const category = expense.category || 'Other';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as { [key in ExpenseCategory]: number });


      const totalAmount = clubExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        club: club.name,
        total: totalAmount,
        ...categorySpending,
        expenseCount: clubExpenses.length,
        average: clubExpenses.length > 0 ? totalAmount / clubExpenses.length : 0,
      };
    }).sort((a,b) => b.total - a.total);

    const total = data.reduce((sum, item) => sum + item.total, 0);
    const activeClubs = data.filter(item => item.total > 0).length;
    const totalExpenseCount = approvedExpenses.length;
    const avg = totalExpenseCount > 0 ? total / totalExpenseCount : 0;

    return {
        chartData: data,
        totalSpending: total,
        activeClubsCount: activeClubs,
        averageExpense: avg,
    }
  }, [clubs, approvedExpenses]);


  const chartConfig = useMemo(() => {
    const config: { [key: string]: { label: string; color: string; } } = {};
    EXPENSE_CATEGORIES.forEach(category => {
      config[category] = {
        label: category,
        color: CATEGORY_COLORS[category],
      };
    });
    return config;
  }, []);

  const pieChartConfig = useMemo(() => {
    const config: { [key: string]: { label: string; color: string; } } = {};
    chartData.forEach((data, index) => {
       config[data.club] = {
           label: data.club,
           color: `hsl(var(--chart-${index + 1}))`,
       };
    });
    return config;
  }, [chartData]);

 const selectedClubCategoryData = useMemo(() => {
    if (!selectedClub) return [];
    return EXPENSE_CATEGORIES.map(category => ({
        name: category,
        value: selectedClub[category] || 0
    })).filter(item => item.value > 0);
  }, [selectedClub]);


  return (
    <div className="space-y-8">
       <div className="space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
         <p className="text-muted-foreground">
            Visualize approved spending and get AI-powered expense insights.
         </p>
       </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Approved Spending</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeClubsCount} / {clubs.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${averageExpense.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>


      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Club Spending Overview</CardTitle>
            <CardDescription>
                A visual breakdown of approved spending across all clubs.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('bar')}>
                <BarChart2 className="h-4 w-4" />
                <span className="sr-only">Bar Chart</span>
            </Button>
            <Button variant={chartType === 'pie' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('pie')}>
                <PieChart className="h-4 w-4" />
                <span className="sr-only">Pie Chart</span>
            </Button>
        </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
                <p>Loading chart data...</p>
            </div>
          ) : chartData.length > 0 && approvedExpenses.length > 0 ? (
            <>
            {chartType === 'bar' ? (
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
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
                    domain={[0, 'dataMax + 1000']}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {EXPENSE_CATEGORIES.map((category) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            fill={chartConfig[category as ExpenseCategory]?.color}
                            stackId="a"
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
                </ChartContainer>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                        <ChartContainer
                            config={selectedClub ? chartConfig : pieChartConfig}
                            className="min-h-[450px] w-full"
                        >
                            <RechartsPieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Pie
                                    data={selectedClub ? selectedClubCategoryData : chartData}
                                    dataKey={selectedClub ? "value" : "total"}
                                    nameKey={selectedClub ? "name" : "club"}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={180}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {(selectedClub ? selectedClubCategoryData : chartData).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={selectedClub? chartConfig[entry.name as ExpenseCategory]?.color : pieChartConfig[entry.club]?.color} />
                                    ))}</Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </RechartsPieChart>
                        </ChartContainer>
                    </div>

                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>
                                {selectedClub ? `${selectedClub.club} Categories` : 'Clubs'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button
                                variant={!selectedClub ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setSelectedClub(null)}
                            >
                                All Clubs
                            </Button>
                            {chartData.map((club) => (
                                <Button
                                    key={club.club}
                                    variant={selectedClub?.club === club.club ? 'secondary' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedClub(club)}
                                >
                                    {club.club}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
            </>
          ) : (
             <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-center text-muted-foreground">No approved expenses to display.</p>
             </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Club Expense Breakdown</CardTitle>
                <CardDescription>
                    A detailed breakdown of spending by club.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Club</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right"># of Expenses</TableHead>
                        <TableHead className="text-right">Avg. Expense</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chartData.map((data) => (
                            <TableRow key={data.club}>
                                <TableCell className="font-medium">{data.club}</TableCell>
                                <TableCell className="text-right">${data.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{data.expenseCount}</TableCell>
                                <TableCell className="text-right">${data.average.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <AiRecommendations chartData={chartData} />
      </div>

    </div>
  );
}
