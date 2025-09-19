
'use server';

/**
 * @fileOverview An AI agent that analyzes aggregated club spending data and provides budget recommendations.
 *
 * - getBudgetRecommendations - A function that handles the budget recommendation process.
 * - BudgetAnalysisInput - The input type for the getBudgetRecommendations function.
 * - BudgetAnalysisOutput - The return type for the getBudgetRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClubSpendingInfoSchema = z.object({
  clubName: z.string().describe('The name of the student club.'),
  totalSpent: z.number().describe('The total amount of money spent by the club.'),
  expenseCount: z.number().describe('The total number of expenses submitted by the club.'),
});

const BudgetAnalysisInputSchema = z.array(ClubSpendingInfoSchema);
export type BudgetAnalysisInput = z.infer<typeof BudgetAnalysisInputSchema>;

const BudgetAnalysisOutputSchema = z.string().describe("The AI-generated recommendations in Markdown format.");
export type BudgetAnalysisOutput = z.infer<typeof BudgetAnalysisOutputSchema>;

export async function getBudgetRecommendations(spendingData: BudgetAnalysisInput): Promise<BudgetAnalysisOutput> {
  // Call the AI flow with the aggregated data provided from the client
  return await budgetRecommendationFlow(spendingData);
}

const prompt = ai.definePrompt({
  name: 'budgetRecommendationPrompt',
  input: { schema: BudgetAnalysisInputSchema },
  output: { schema: BudgetAnalysisOutputSchema },
  prompt: `You are a financial advisor for a university student organization. Your task is to analyze the spending of various student clubs and provide actionable recommendations for the finance administrators.

Analyze the following club spending data. Each item shows the club name, its total spending, and the number of expenses it has filed.
{{#each this}}
- Club: {{clubName}}, Total Spent: \${{totalSpent}}, Number of Expenses: {{expenseCount}}
{{/each}}

Based on this data, provide a concise report in Markdown format with the following sections:

### Spending Analysis
Briefly summarize the spending patterns. Identify the highest-spending clubs and any clubs with no spending.

### Recommendations for Admins
Provide 2-3 specific, actionable recommendations for the finance administrators. For example, suggest which clubs might need guidance, if spending seems too high or low, or if there are opportunities for financial planning workshops.

### Financial Health Snapshot
Comment on the overall financial activity. Are clubs actively using their budgets? Does the distribution of spending seem reasonable?
`,
});

const budgetRecommendationFlow = ai.defineFlow(
  {
    name: 'budgetRecommendationFlow',
    inputSchema: BudgetAnalysisInputSchema,
    outputSchema: BudgetAnalysisOutputSchema,
  },
  async (input) => {
    if (!input || input.length === 0) {
      return "### No Spending Data\n\nThere is no spending data available to analyze.";
    }

    try {
      const { output } = await prompt(input);
      
      if (typeof output === "string" && output.trim() !== "") {
        return output;
      }
    } catch (err: any) {
      console.error("Prompt failed:", err);
      if (err.message && (err.message.includes("429") || err.message.includes("quota"))) {
        return "QUOTA_ERROR: You have exceeded your current API quota. Please check your Google AI plan and billing details, or try again later.";
      }
      return "### Error\n\nCould not generate recommendations. The AI model may be temporarily unavailable.";
    }

    return "### Recommendations\n- No recommendations available at this time. The AI model returned an empty or invalid response.";
  }
);
