
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
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Club, User, RepresentativeRequest } from '@/lib/types';
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
    const selectedClub = clubs.find((club) => club.id === values.clubId);

    if (!selectedClub) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'The selected club could not be found. Please try again.',
      });
      return;
    }

    try {
      const newRequest: Omit<RepresentativeRequest, 'id'> = {
        userId: user.id,
        userName: user.name,
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        status: 'pending',
        requestDate: new Date().toISOString(),
      };
      await addDoc(collection(db, 'representativeRequests'), newRequest);

      toast({
        title: 'Request Sent!',
        description: `Your request to represent ${selectedClub.name} has been sent for admin approval.`,
      });
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'Could not submit your request. Please try again.',
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
            Select a club to request representation. Your request will be sent to an administrator for approval.
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
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
