'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';
import { RegisterClubDialog } from '@/components/clubs/register-club-dialog';

export default function ClubsPage() {
  const { user, clubs } = useUser();

  // The AppLayout guarantees that user and clubs are loaded.
  const userClubs = clubs.filter(
    (club) => club.representativeId === user!.id
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Clubs</h1>
          <p className="text-muted-foreground">Manage your registered clubs.</p>
        </div>
        <RegisterClubDialog />
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
          <p className="text-muted-foreground md:col-span-3">
            You are not a representative for any clubs.
          </p>
        )}
      </div>
    </div>
  );
}
