import { Suspense } from 'react';
import { PrioritizedList } from './prioritized-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

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

export function AiExpensePrioritization() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        AI Priority Queue
      </h2>
      <Suspense fallback={<PrioritizedListSkeleton />}>
        {/* @ts-expect-error Server Component */}
        <PrioritizedList />
      </Suspense>
    </div>
  );
}
