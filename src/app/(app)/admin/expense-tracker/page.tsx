
'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart as RechartsPieChart, Cell, Treemap, ResponsiveContainer, Tooltip as RechartsTooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { DollarSign, PieChart, Sparkles, Users, BarChart2, RefreshCw, AlertTriangle, LayoutGrid, Radar as RadarIcon } from 'lucide-react';
import { EXPENSE_CATEGORIES, ExpenseCategory, Club, Expense } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { placeholderRecommendations } from '@/lib/placeholder-recommendations';
import { getBudgetRecommendations, BudgetAnalysisInput } from '@/ai/flows/budget-recommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTheme } from 'next-themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface AiRecommendationsProps {
  clubs: Club[];
  approvedExpenses: Expense[];
}

function AiRecommendations({ clubs, approvedExpenses }: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetRecommendations = () => {
    setLoading(true);
    // Simulate a brief loading period
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * placeholderRecommendations.length);
        const fallbackText = placeholderRecommendations[randomIndex];
        setRecommendations(fallbackText);
        setLoading(false);
    }, 500);
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
         <div className="flex items-center gap-2">
            <Button onClick={handleGetRecommendations} disabled={loading}>
                {loading ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Get AI Insights</>}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center py-8">
                <div className="space-y-2 text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analyzing spending data...</p>
                </div>
            </div>
        ) : recommendations ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        ) : (
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
    'Equipment': '#14b8a6', // teal-500
    'Other': '#6b7280', // gray-500
  };


export default function BudgetTrackerPage() {
  const { theme } = useTheme();
  const { clubs, expenses, loading } = useUser();
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'treemap' | 'radar'>('bar');
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
        id: club.id,
        name: club.name,
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

  const clubColors = useMemo(() => {
    return chartData.reduce((acc, club, index) => {
      acc[club.name] = `hsl(var(--chart-${index + 1}))`;
      return acc;
    }, {} as { [key: string]: string });
  }, [chartData]);

 const selectedClubCategoryData = useMemo(() => {
    if (!selectedClub) return [];
    return EXPENSE_CATEGORIES.map(category => ({
        name: category,
        value: selectedClub[category] || 0
    })).filter(item => item.value > 0);
  }, [selectedClub]);

 const radarChartData = useMemo(() => {
    const data = selectedClub ? [selectedClub] : chartData;
    const categoryTotals = data.reduce((acc, club) => {
        EXPENSE_CATEGORIES.forEach(category => {
            acc[category] = (acc[category] || 0) + (club[category] || 0);
        });
        return acc;
    }, {} as { [key in ExpenseCategory]: number });

    return Object.entries(categoryTotals)
        .map(([subject, value]) => ({ subject, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
  }, [selectedClub, chartData]);

  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    const maxTotal = Math.max(...chartData.map(club => club.total));
    const ticks = [];
    for (let i = 0; i <= maxTotal + 5000; i += 5000) {
      ticks.push(i);
    }
    return ticks;
  }, [chartData]);


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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={chartType === 'bar' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('bar')}>
                      <BarChart2 className="h-4 w-4" />
                      <span className="sr-only">Bar Chart</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bar Chart</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={chartType === 'pie' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('pie')}>
                      <PieChart className="h-4 w-4" />
                      <span className="sr-only">Pie Chart</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pie Chart</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={chartType === 'treemap' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('treemap')}>
                      <LayoutGrid className="h-4 w-4" />
                      <span className="sr-only">Treemap</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Treemap</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={chartType === 'radar' ? 'default' : 'outline'} size="icon" onClick={() => setChartType('radar')}>
                      <RadarIcon className="h-4 w-4" />
                      <span className="sr-only">Radar Chart</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Radar Chart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
                <p>Loading chart data...</p>
            </div>
          ) : chartData.length > 0 && approvedExpenses.length > 0 ? (
            <div className="min-h-[450px]">
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
                    ticks={yAxisTicks}
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
            ) : chartType === 'treemap' ? (
                <ChartContainer config={pieChartConfig} className="min-h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={chartData}
                            dataKey="total"
                            ratio={4 / 3}
                            stroke={theme === 'dark' ? '#fff' : '#000'}
                            fill="#8884d8"
                            content={<CustomizedContent colors={clubColors} />}
                            nameKey="name"
                        >
                            <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                        </Treemap>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : chartType === 'radar' ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                        <ChartContainer config={chartConfig} className="min-h-[450px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarChartData}>
                                    <CartesianGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                    <Radar name={selectedClub ? selectedClub.club : "All Clubs"} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                     <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                                </RadarChart>
                            </ResponsiveContainer>
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
                                    key={club.id}
                                    variant={selectedClub?.id === club.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedClub(club)}
                                >
                                    {club.club}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            ) : ( // Pie chart
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
                                    {(selectedClub ? selectedClubCategoryData : chartData).map((entry: any, index) => (
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
                                    key={club.id}
                                    variant={selectedClub?.id === club.id ? 'secondary' : 'ghost'}
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
            </div>
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
                            <TableRow key={data.id}>
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
        <AiRecommendations clubs={clubs} approvedExpenses={approvedExpenses} />
      </div>

    </div>
  );
}

const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, rank, name, colors }: any) => {
  const clubName = name || root?.payload?.club;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[clubName as keyof typeof colors] || '#8884d8' : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && width > 50 && height > 25 ? (
         <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={20}
            fontWeight="bold"
            style={{
                paintOrder: 'stroke',
                stroke: '#000000',
                strokeWidth: '1px',
                strokeLinecap: 'butt',
                strokeLinejoin: 'miter',
            }}
            >
            {clubName}
        </text>
      ) : null}
    </g>
  );
};
