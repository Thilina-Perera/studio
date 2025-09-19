
'use server';

/**
 * @fileOverview An AI agent that analyzes club spending from a JSON file and provides budget recommendations.
 *
 * - getBudgetRecommendations - A function that handles the budget recommendation process.
 * - BudgetAnalysisInput - The input type for the getBudgetRecommendations function.
 * - BudgetAnalysisOutput - The return type for the getBudgetRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';
import path from 'path';

// The input is now a JSON string containing the expense data.
const BudgetAnalysisInputSchema = z.string().describe('A JSON string representing the list of clubs and their expenses.');
export type BudgetAnalysisInput = z.infer<typeof BudgetAnalysisInputSchema>;

const BudgetAnalysisOutputSchema = z.string().describe("The AI-generated recommendations in Markdown format.");
export type BudgetAnalysisOutput = z.infer<typeof BudgetAnalysisOutputSchema>;

export async function getBudgetRecommendations(): Promise<BudgetAnalysisOutput> {
  // Read the expense data from the JSON file.
  const filePath = path.join(process.cwd(), 'src', 'lib', 'expense-data.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return budgetRecommendationFlow(jsonData);
}

const prompt = ai.definePrompt({
  name: 'budgetRecommendationPrompt',
  input: { schema: BudgetAnalysisInputSchema },
  output: { schema: BudgetAnalysisOutputSchema },
  prompt: `You are a financial advisor for a university student organization. Your task is to analyze the spending of various student clubs from the provided JSON data and provide actionable recommendations.

Analyze the following JSON club spending data:
{{{this}}}

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
    // Check if the input JSON string is empty or just contains an empty array/object.
    try {
        const data = JSON.parse(input);
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return "### No Spending Data\n\nThere is no spending data available to analyze.";
        }
    } catch (e) {
        return "### Invalid Data Format\n\nThe expense data file appears to be corrupted or not in a valid JSON format.";
    }

    const { output } = await prompt(input);
    
    // Safety check: ensure output is always a string
    let safeOutput: string;

    if (typeof output === "string" && output.trim() !== "") {
      safeOutput = output;
    } else {
      // Default fallback string if AI returns null/undefined
      safeOutput = "### Recommendations\n- No recommendations available at this time. The AI model may have returned an empty response.";
    }
    
    return safeOutput;
  }
);

