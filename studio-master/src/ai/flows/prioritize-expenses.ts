'use server';

/**
 * @fileOverview An AI agent that analyzes expense descriptions and ranks reimbursements by urgency and relevance.
 *
 * - prioritizeExpenses - A function that handles the expense prioritization process.
 * - PrioritizeExpensesInput - The input type for the prioritizeExpenses function.
 * - PrioritizeExpensesOutput - The return type for the prioritizeExpenses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeExpensesInputSchema = z.array(
  z.object({
    expenseId: z.string().describe('The unique identifier for the expense.'),
    description: z.string().describe('A detailed description of the expense.'),
    amount: z.number().describe('The amount of the expense.'),
  })
);
export type PrioritizeExpensesInput = z.infer<typeof PrioritizeExpensesInputSchema>;

const PrioritizeExpensesOutputSchema = z.array(
  z.object({
    expenseId: z.string().describe('The unique identifier for the expense.'),
    priorityScore: z
      .number()
      .describe(
        'A score indicating the priority of the expense, with higher scores indicating higher priority.'
      ),
    reason: z
      .string()
      .describe(
        'The reason for the assigned priority score, based on urgency and relevance.'
      ),
  })
);
export type PrioritizeExpensesOutput = z.infer<typeof PrioritizeExpensesOutputSchema>;

export async function prioritizeExpenses(input: PrioritizeExpensesInput): Promise<PrioritizeExpensesOutput> {
  return prioritizeExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeExpensesPrompt',
  input: {schema: PrioritizeExpensesInputSchema},
  output: {schema: PrioritizeExpensesOutputSchema},
  prompt: `You are a finance expert tasked with prioritizing expense reimbursements based on urgency and relevance.

Analyze the following expenses and assign a priority score (higher is more urgent) and a reason for the score. Return the output in JSON format.

Expenses:
{{#each this}}
- Expense ID: {{expenseId}}
  Description: {{description}}
  Amount: {{amount}}
{{/each}}`,
});

const prioritizeExpensesFlow = ai.defineFlow(
  {
    name: 'prioritizeExpensesFlow',
    inputSchema: PrioritizeExpensesInputSchema,
    outputSchema: PrioritizeExpensesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

