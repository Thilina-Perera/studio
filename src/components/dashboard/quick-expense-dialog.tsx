
'use client';
import { useState, useMemo, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Scan, Sparkles, Upload, CheckCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { extractReceiptDetails } from '@/ai/flows/extract-receipt-details';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  clubId: z.string().min(1, 'Please select a club.'),
  description: z.string(), // Not required, but available
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number."})
    .positive('Amount must be a positive number.'),
  category: z.enum(EXPENSE_CATEGORIES),
  receiptDataUri: z.string().min(1, 'A receipt is required for Quick Submit.'),
});

// Define types needed for the server action call locally
type ReceiptDetailsInput = {
  receiptDataUri: string;
}

export function QuickExpenseDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, clubs } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(undefined);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const availableClubs = useMemo(() => {
    if (!user) return [];
    return role === 'representative'
      ? clubs.filter((club) => club.representativeId === user?.id)
      : clubs;
  }, [user, role, clubs]);

  useEffect(() => {
    // When the dialog opens, if there's only one club, pre-select it.
    if (isOpen && availableClubs.length === 1) {
      form.setValue('clubId', availableClubs[0].id);
    }
  }, [isOpen, availableClubs, form]);

  const resetForm = () => {
    form.reset({
      clubId: availableClubs.length === 1 ? availableClubs[0].id : '',
      description: '',
      amount: '' as any,
      receiptDataUri: '',
      category: 'Other',
    });
    setReceiptFileName(undefined);
    setUploadProgress(0);
    setIsProcessing(false);
    setAiError(null);
  };

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
        toast({
            variant: "destructive",
            title: "File Too Large",
            description: "Receipt file size cannot exceed 4MB for AI processing."
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
        setAiError(null);
    }
    
    reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        form.setValue('receiptDataUri', dataUri);
        setUploadProgress(100);

        try {
            const result = await extractReceiptDetails({ receiptDataUri: dataUri });
            form.setValue('amount', result.amount);
            form.setValue('category', result.category);
            toast({
              title: "Receipt Scanned!",
              description: "Expense details have been pre-filled. Please review and submit."
            });
        } catch (error: any) {
            console.error("AI receipt processing error:", error);
            setAiError("Could not automatically extract details from the receipt. Please enter them manually.");
        } finally {
            setIsProcessing(false);
        }
    };

    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
            variant: "destructive",
            title: "File Read Failed",
            description: "Could not read the selected file. Please try again."
        });
        resetForm();
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
            description: values.description || 'Quick Submit from Receipt',
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
        setIsOpen(false);
    } catch (error) {
        console.error("Error submitting expense: ", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not submit your expense. Please try again.",
        })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Quick Expense Submit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Expense Submit</DialogTitle>
          <DialogDescription>
            Upload a receipt and let AI fill in the details. Review, add an optional description, and submit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="receiptDataUri"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Receipt</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                id="receipt-upload"
                                type="file" 
                                accept="image/*,.pdf"
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                onChange={handleReceiptChange}
                                disabled={isProcessing}
                                />
                                <Button asChild variant="outline" className="w-full cursor-pointer">
                                    <label htmlFor="receipt-upload" className="flex items-center justify-center gap-2 cursor-pointer">
                                        {receiptFileName ? <CheckCircle /> : <Upload />}
                                        <span>{receiptFileName || "Upload Receipt"}</span>
                                    </label>
                                </Button>
                            </div>
                        </FormControl>
                        {isProcessing && (
                            <div className="space-y-1">
                                <Progress value={uploadProgress} className="w-full" />
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    {uploadProgress < 100 ? `Uploading ${receiptFileName}...` : `Scanning with AI...`}
                                </p>
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
                />
            
            {aiError && (
                <Alert variant="destructive">
                    <AlertTitle>AI Processing Failed</AlertTitle>
                    <AlertDescription>{aiError}</AlertDescription>
                </Alert>
            )}

            {form.getValues('receiptDataUri') && !isProcessing && (
                <div className="space-y-4 animate-in fade-in-50 duration-500">
                    <FormField
                    control={form.control}
                    name="clubId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Club</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                        >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the club" />
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
                            value={field.value}
                        >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
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
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Add an optional description for context"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            )}


            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || isProcessing || !form.formState.isValid}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Expense'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
