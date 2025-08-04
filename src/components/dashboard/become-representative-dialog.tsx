
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Club, User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  clubId: z.string().min(1, 'Please enter a Club ID.'),
});

interface BecomeRepresentativeDialogProps {
  user: User;
  clubs: Club[];
}

export function BecomeRepresentativeDialog({ user, clubs }: BecomeRepresentativeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const clubToUpdate = clubs.find(
      (club) => club.id.toLowerCase() === values.clubId.toLowerCase()
    );

    if (!clubToUpdate) {
      form.setError('clubId', {
        type: 'manual',
        message: 'No club found with that ID. Please check and try again.',
      });
      return;
    }

    try {
      // Use the actual club ID (with correct casing) from the found club object
      const clubRef = doc(db, 'clubs', clubToUpdate.id);
      await updateDoc(clubRef, {
        representativeId: user.id,
      });

      toast({
        title: 'Success!',
        description: `You are now the representative for ${clubToUpdate.name}.`,
      });
      setIsOpen(false);
      // Refresh the page or data to reflect the role change
      router.refresh();
    } catch (error) {
      console.error('Error updating club representative:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not assign you as the representative. Please try again.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Become a Representative</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Become a Club Representative</DialogTitle>
          <DialogDescription>
            Enter the unique ID for the club you want to represent. This will
            grant you access to the representative dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="clubId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the Club ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Verifying...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
