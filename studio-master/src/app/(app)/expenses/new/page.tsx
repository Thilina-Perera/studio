
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  clubId: z.string().min(1, 'Please select a club.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  amount: z.coerce
    .number()
    .positive('Amount must be a positive number.'),
  receipt: z.any().optional(),
});

function NewExpensePageSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>
          Fill out the form below to submit a new expense for reimbursement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
        </div>
         <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
         <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}


export default function NewExpensePage() {
  const { user, role, clubs, loading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubId: '',
      description: '',
      amount: '' as any,
      receipt: undefined,
    },
  });
    
  // Representatives can submit for their clubs, students can submit for any club.
  const availableClubs = role === 'representative' 
    ? clubs.filter((club) => club.representativeId === user?.id)
    : clubs;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to submit an expense.",
        })
        return;
    }
    try {
        const selectedClub = clubs.find(c => c.id === values.clubId);
        const newExpense: Omit<Expense, 'id'> = {
            clubId: values.clubId,
            clubName: selectedClub?.name || 'Unknown Club',
            description: values.description,
            amount: values.amount,
            status: 'Pending',
            submittedDate: new Date().toISOString(),
            submitterId: user.id,
            submitterName: user.name,
        };
        await addDoc(collection(db, 'expenses'), newExpense);
        
        toast({
            title: "Expense Submitted!",
            description: "Your expense has been successfully submitted for review.",
        })
        router.push('/dashboard');
        // Ideally, we'd refetch the data or update the state locally
        router.refresh();
    } catch (error) {
        console.error("Error submitting expense: ", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not submit your expense. Please try again.",
        })
    }
  }

  if (loading) {
    return <NewExpensePageSkeleton />
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit New Expense</CardTitle>
        <CardDescription>
          Fill out the form below to submit a new expense for reimbursement.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                        <SelectValue placeholder="Select the club for this expense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableClubs.map((club) => (
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Pizza and drinks for the weekly meeting"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear and detailed description of the expense.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="99.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="receipt"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Receipt</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={e => onChange(e.target.files?.[0])} {...rest} />
                  </FormControl>
                   <FormDescription>
                    Upload a clear image or PDF of the receipt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Expense"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
