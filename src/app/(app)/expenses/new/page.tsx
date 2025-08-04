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
import { mockClubs } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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

export default function NewExpensePage() {
  const { user, role } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  // Representatives can submit for their clubs, students can submit for any club.
  const availableClubs = role === 'representative' 
    ? mockClubs.filter((club) => club.representativeId === user?.id)
    : mockClubs;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubId: '',
      description: '',
      amount: '' as any, // Initialize as empty string to be a controlled component
      receipt: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
        title: "Expense Submitted!",
        description: "Your expense has been successfully submitted for review.",
    })
    router.push('/dashboard');
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
                    <Input type="file" onChange={e => onChange(e.target.files)} {...rest} />
                  </FormControl>
                   <FormDescription>
                    Upload a clear image or PDF of the receipt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit Expense</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
