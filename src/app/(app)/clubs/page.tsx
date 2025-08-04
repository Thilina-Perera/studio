
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { useFirebase } from '@/hooks/use-firebase';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ClubsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ClubsPage() {
  const { user, loading: userLoading } = useUser();
  const { clubs, loading: firebaseLoading } = useFirebase();

  if (userLoading || firebaseLoading || !user) {
    return <ClubsPageSkeleton />;
  }

  const userClubs = clubs.filter(
    (club) => club.representativeId === user?.id
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Clubs</h1>
            <p className="text-muted-foreground">
                Manage your registered clubs.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Club
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userClubs.map((club) => (
          <Card key={club.id}>
            <CardHeader>
              <CardTitle>{club.name}</CardTitle>
              <CardDescription>{club.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href={`/clubs/${club.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {userClubs.length === 0 && (
            <p className="text-muted-foreground md:col-span-3">You are not a representative for any clubs.</p>
        )}
      </div>
    </div>
  );
}
