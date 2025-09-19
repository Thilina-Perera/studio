
'use server';

/**
 * @fileOverview An AI agent that analyzes club spending and provides budget recommendations.
 *
 * - getBudgetRecommendations - A function that handles the budget recommendation process.
 * - BudgetAnalysisInput - The input type for the getBudgetRecommendations function.
 * - BudgetAnalysisOutput - The return type for the getBudgetRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BudgetAnalysisInputSchema = z.array(
  z.object({
    clubName: z.string().describe('The name of the club.'),
    totalSpent: z.number().describe('The total amount spent by the club.'),
  })
);
export type BudgetAnalysisInput = z.infer<typeof BudgetAnalysisInputSchema>;

const BudgetAnalysisOutputSchema = z.string().describe("The AI-generated recommendations in Markdown format.");
export type BudgetAnalysisOutput = z.infer<typeof BudgetAnalysisOutputSchema>;

export async function getBudgetRecommendations(
  input: BudgetAnalysisInput
): Promise<BudgetAnalysisOutput> {
  return budgetRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetRecommendationPrompt',
  input: { schema: BudgetAnalysisInputSchema },
  output: { schema: BudgetAnalysisOutputSchema },
  prompt: `You are a financial advisor for a university student organization. Your task is to analyze the spending of various student clubs and provide actionable recommendations.

Analyze the following club spending data:
{{#if this}}
{{#each this}}
- Club: {{clubName}}, Total Spent: \${{totalSpent}}
{{/each}}
{{else}}
- No spending data available.
{{/if}}

Based on this data, provide a concise report in Markdown format with the following sections:

### Spending Analysis
Briefly summarize the spending patterns. Identify the highest-spending clubs. If there is little or no data, state that a meaningful analysis cannot be performed yet.

### Recommendations
Provide 2-3 specific, actionable recommendations. If spending is high, suggest cost-cutting or fundraising. If spending is low, suggest ways to utilize the budget. If there is no spending, recommend that clubs start submitting expenses.

### Financial Health Snapshot
Comment on the spending efficiency. Which clubs seem to be managing their funds effectively? Which might need support? If data is insufficient, mention that.
`,
});

const budgetRecommendationFlow = ai.defineFlow(
  {
    name: 'budgetRecommendationFlow',
    inputSchema: BudgetAnalysisInputSchema,
    outputSchema: BudgetAnalysisOutputSchema,
  },
  async (input) => {
    // Filter out clubs with zero spending to provide more meaningful analysis
    const activeClubs = input.filter(club => club.totalSpent > 0);
    
    if (activeClubs.length === 0) {
        return "### No Spending Data\n\nThere is no approved spending data to analyze. Please check back when clubs have approved expenses to get AI recommendations.";
    }

    const { output } = await prompt(activeClubs);

    // This is the critical check. If the output is null or undefined, return a default string.
    if (!output) {
      return "The AI analysis returned an empty result. This can happen if there isn't enough data to analyze or due to a temporary issue. Please try again later when more expenses have been approved.";
    }
    
    return output;
  }
);
