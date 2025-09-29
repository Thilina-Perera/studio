'use client';
import { PrioritizedList } from './prioritized-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { AlertTriangle, Sparkles } from 'lucide-react';
import type { Club, Expense, User } from '@/lib/types';
import { useAiPrioritization } from '@/hooks/use-ai-prioritization';
import { Button } from '../ui/button';
import Link from 'next/link';

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
  users: User[];
}

export function AiExpensePrioritization({ expenses, clubs, users }: AiExpensePrioritizationProps) {
  const { prioritizedExpenses, loading, error, cooldown, runPrioritization } = useAiPrioritization({ expenses, clubs, users });

  const handleRunPrioritization = () => {
    runPrioritization();
  };

  const getButtonContent = () => {
    if (cooldown) {
        return "Waiting...";
    }
    if (loading) {
        return "Prioritizing...";
    }
    return <><Sparkles className="mr-2 h-4 w-4" /> Prioritize with AI</>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          AI Priority Queue
        </h2>
        <Button 
          onClick={handleRunPrioritization} 
          disabled={loading || cooldown}
          className="animate-glow"
        >
          {getButtonContent()}
        </Button>
      </div>

      {loading && <PrioritizedListSkeleton />}
      {error && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                AI Prioritization Error
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-sm font-medium">{error}</p>
            {error.includes("quota") && 
                <p className="text-xs mt-2 text-muted-foreground">
                    The free tier of the AI model has a daily usage limit. For more information, please see the{' '}
                    <Link href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" className="underline">
                        Google AI documentation on rate limits
                    </Link>.
                </p>
            }
            </CardContent>
        </Card>
      )}
      {!loading && !error && (
        <PrioritizedList prioritizedExpenses={prioritizedExpenses} clubs={clubs} />
      )}
    </div>
  );
}
