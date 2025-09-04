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
{{#each this}}
- Club: {{clubName}}, Total Spent: \${{totalSpent}}
{{/each}}

Based on this data, provide a concise report in Markdown format with the following sections:

### Spending Analysis
Briefly summarize the spending patterns. Identify the highest-spending clubs and any potential outliers.

### Recommendations
Provide 2-3 specific, actionable recommendations. These could include suggestions for cost-cutting, ideas for fundraising for high-spending clubs, or reallocating budget from lower-spending clubs. Frame your advice constructively to help the clubs succeed financially.

### Profitability Insights
Based on the provided spending data, comment on which clubs might be operating efficiently and which might need financial strategy support. Since revenue data is not provided, frame this as an analysis of spending efficiency.`,
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
        return "There is no spending data to analyze. Please check back when clubs have approved expenses.";
    }
    const { output } = await prompt(activeClubs);
    return output!;
  }
);
