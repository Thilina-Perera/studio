
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Club, User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  clubId: z.string().min(1, 'Please select a club.'),
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
      (club) => club.id === values.clubId
    );

    if (!clubToUpdate) {
        toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: 'The selected club could not be found. Please try again.',
        });
      return;
    }

    try {
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
            Select the club you want to represent from the list below. This will
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
                  <FormLabel>Club</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a club to represent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
