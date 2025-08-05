
'use client';
import { useState } from 'react';
import type { Club, PrioritizedExpense, ExpenseStatus } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { Button } from '../ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface PrioritizedListProps {
  prioritizedExpenses: PrioritizedExpense[];
  clubs: Club[];
}

export function PrioritizedList({
  prioritizedExpenses,
  clubs,
}: PrioritizedListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (prioritizedExpenses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No pending expenses to prioritize.
      </div>
    );
  }

  const getClubName = (expense: PrioritizedExpense) => {
    if (expense.clubName) return expense.clubName;
    return clubs.find((c) => c.id === expense.clubId)?.name || 'Unknown Club';
  };

  const handleToggleExpand = (expenseId: string) => {
    setExpandedId(expandedId === expenseId ? null : expenseId);
    setComment(''); // Reset comment when toggling
  };

  const handleStatusChange = async (
    expenseId: string,
    status: ExpenseStatus
  ) => {
    const expenseRef = doc(db, 'expenses', expenseId);
    try {
      await updateDoc(expenseRef, { status });
      toast({
        title: 'Status Updated',
        description: `Expense has been marked as ${status}.`,
      });
      // You might want to refresh the data here
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the expense status.',
      });
    }
  };

  const handleCommentSubmit = async (expenseId: string) => {
    if (!comment) {
        toast({
            variant: "destructive",
            title: "Comment is empty",
            description: "Please enter a comment before submitting."
        });
        return;
    }
    setIsSubmitting(true);
    const expenseRef = doc(db, 'expenses', expenseId);
    try {
        await updateDoc(expenseRef, { adminComment: comment });
        toast({
            title: 'Comment Saved!',
            description: 'Your comment has been added to the expense.'
        });
        setComment('');
        setExpandedId(null);
    } catch (error) {
        console.error("Error saving comment: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your comment. Please try again."
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {prioritizedExpenses.map((expense) => (
        <Card key={expense.id} className="border-primary/50 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              <span>High Priority</span>
            </CardTitle>
            <CardDescription>AI-flagged for immediate review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div>
              <p className="text-sm font-semibold">{getClubName(expense)}</p>
              <p className="text-sm text-muted-foreground">
                {expense.description}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold">${expense.amount.toFixed(2)}</p>
              <StatusBadge status={expense.status} />
            </div>
            <p className="text-xs text-muted-foreground italic border-l-2 pl-2">
              <strong>AI Reason:</strong> {expense.reason}
            </p>
            {expandedId === expense.id && (
              <div className="space-y-4 pt-4 border-t">
                 <div className="flex justify-around">
                     <Button variant="outline" size="sm" onClick={() => handleStatusChange(expense.id, 'Approved')}>Approve</Button>
                     <Button variant="outline" size="sm" onClick={() => handleStatusChange(expense.id, 'Rejected')}>Reject</Button>
                 </div>
                 <div className="space-y-2">
                    <label htmlFor={`comment-${expense.id}`} className="text-sm font-medium">Admin Comment</label>
                    <Textarea 
                        id={`comment-${expense.id}`}
                        placeholder="Leave a comment for the submitter..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                 </div>
                 <Button className="w-full" onClick={() => handleCommentSubmit(expense.id)} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={expandedId === expense.id ? 'secondary' : 'default'}
              onClick={() => handleToggleExpand(expense.id)}
            >
              {expandedId === expense.id ? 'Collapse' : 'Review Expense'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
