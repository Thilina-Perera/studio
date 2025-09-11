
'use client';

import { useState } from 'react';
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
import type { Expense, ExpenseCategory } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, FileUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  clubId: z.string().min(1, 'Please select a club.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.'),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number."})
    .positive('Amount must be a positive number.'),
  category: z.enum(EXPENSE_CATEGORIES),
  receiptDataUri: z.string().optional(),
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clubId: '',
      description: '',
      amount: '' as any,
      receiptDataUri: '',
      category: 'Other',
    },
  });
    
  const availableClubs = role === 'representative' 
    ? clubs.filter((club) => club.representativeId === user?.id)
    : clubs;

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1024 * 1024) { // 1MB limit
        toast({
            variant: "destructive",
            title: "File Too Large",
            description: "Receipt file size cannot exceed 1MB to be stored in the database."
        });
        return;
    }
    
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
        if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
        }
    };

    reader.onloadstart = () => {
        setIsProcessing(true);
        setUploadProgress(0);
        setReceiptFileName(file.name);
    }
    
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        form.setValue('receiptDataUri', dataUri);
        setUploadProgress(100);
        toast({
          title: "Receipt Attached",
          description: `${file.name} has been attached successfully.`
        });
        setTimeout(() => setIsProcessing(false), 500); // Give time for progress bar to hit 100%
    };

    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
            variant: "destructive",
            title: "File Read Failed",
            description: "Could not read the selected file. Please try again."
        });
        setIsProcessing(false);
        setReceiptFileName(undefined);
        setUploadProgress(0);
    }
    reader.readAsDataURL(file);
  }

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
            category: values.category,
            status: 'Pending',
            submittedDate: new Date().toISOString(),
            submitterId: user.id,
            submitterName: user.name,
            receiptDataUri: values.receiptDataUri,
        };
        await addDoc(collection(db, 'expenses'), newExpense);
        
        toast({
            title: "Expense Submitted!",
            description: "Your expense has been successfully submitted for review.",
        })
        router.push('/dashboard');
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
                    <Input type="number" step="0.01" placeholder="99.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category for this expense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorizing helps in better financial tracking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel>Receipt</FormLabel>
                <FormControl>
                    <Input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={handleReceiptChange}
                    disabled={isProcessing}
                    />
                </FormControl>
                <FormDescription>
                Upload a clear image or PDF of the receipt (max 1MB).
                </FormDescription>
                {isProcessing && (
                    <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">Uploading {receiptFileName}...</p>
                    </div>
                )}
                {form.getValues('receiptDataUri') && !isProcessing && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{receiptFileName} attached.</span>
                </div>
                )}
                <FormMessage />
            </FormItem>

            <Button type="submit" disabled={form.formState.isSubmitting || isProcessing}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Expense"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
