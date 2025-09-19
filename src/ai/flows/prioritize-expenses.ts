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
    clubName: z.string().describe('The name of the club submitting the expense.'),
    submitterName: z.string().describe('The name of the person who submitted the expense.'),
  })
);
export type PrioritizeExpensesInput = z.infer<typeof PrioritizeExpensesInputSchema>;

const PrioritizeExpensesOutputSchema = z.array(
  z.object({
    expenseId: z.string().describe('The unique identifier for the expense.'),
    priorityScore: z
      .number()
      .describe(
        'A score from 1-10 indicating the priority, with 10 being the highest. Base the score on urgency (e.g., time-sensitive items), relevance to the club\'s purpose (e.g., educational materials for an academic club), and potential impact.'
      ),
    reason: z
      .string()
      .describe(
        'A concise reason for the score, referencing the description, club, and amount.'
      ),
  })
);
export type PrioritizeExpensesOutput = z.infer<typeof PrioritizeExpensesOutputSchema>;

export async function prioritizeExpenses(input: PrioritizeExpensesInput): Promise<PrioritizeExpensesOutput> {
  if (input.length === 0) {
    return [];
  }
  return prioritizeExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeExpensesPrompt',
  input: {schema: PrioritizeExpensesInputSchema},
  output: {schema: PrioritizeExpensesOutputSchema},
  prompt: `You are a finance expert for a university, tasked with prioritizing expense reimbursements. Your goal is to identify the most critical expenses that need immediate attention.

Analyze the following expenses. Consider the club's name (e.g., educational vs. social), the expense description, and the amount to assign a priority score from 1 (lowest) to 10 (highest). Provide a concise reason for your score.

Return the output in JSON format.

Expenses:
{{#each this}}
- Expense ID: {{expenseId}}
  Club: {{clubName}}
  Submitter: {{submitterName}}
  Description: {{description}}
  Amount: \${{amount}}
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
    return output || [];
  }
);
