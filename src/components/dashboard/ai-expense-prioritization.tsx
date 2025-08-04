'use client';
import { PrioritizedList } from './prioritized-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { AlertTriangle, Sparkles } from 'lucide-react';
import type { Club, Expense } from '@/lib/types';
import { useAiPrioritization } from '@/hooks/use-ai-prioritization';
import { Button } from '../ui/button';

function PrioritizedListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface AiExpensePrioritizationProps {
  expenses: Expense[];
  clubs: Club[];
}

export function AiExpensePrioritization({ expenses, clubs }: AiExpensePrioritizationProps) {
  const { prioritizedExpenses, loading, error, runPrioritization } = useAiPrioritization({ expenses });

  const handleRunPrioritization = () => {
    runPrioritization();
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          AI Priority Queue
        </h2>
        <Button onClick={handleRunPrioritization} disabled={loading}>
          {loading ? 'Prioritizing...' : <><Sparkles className="mr-2 h-4 w-4" /> Prioritize with AI</>}
        </Button>
      </div>

      {loading && <PrioritizedListSkeleton />}
      {error && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Error
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-sm">Could not load AI-prioritized expenses: {error}</p>
            {error.includes("429") && <p className="text-xs mt-2 text-muted-foreground">You have exceeded your API quota. Please check your Google AI plan and billing details, or try again later.</p>}
            </CardContent>
        </Card>
      )}
      {!loading && !error && (
        <PrioritizedList prioritizedExpenses={prioritizedExpenses} clubs={clubs} />
      )}
    </div>
  );
}
