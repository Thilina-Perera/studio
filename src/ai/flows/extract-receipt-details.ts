
'use server';

/**
 * @fileOverview An AI agent that analyzes a receipt image and extracts expense details.
 *
 * - extractReceiptDetails - A function that handles the receipt analysis process.
 * - ReceiptDetailsInput - The input type for the extractReceiptDetails function.
 * - ReceiptDetailsOutput - The return type for the extractReceiptDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { EXPENSE_CATEGORIES } from '@/lib/types';

export const ReceiptDetailsInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReceiptDetailsInput = z.infer<typeof ReceiptDetailsInputSchema>;

export const ReceiptDetailsOutputSchema = z.object({
  amount: z.number().describe('The total amount of the expense. Extract this from the total or final amount on the receipt.'),
  category: z.enum(EXPENSE_CATEGORIES).describe('The most likely category for the expense based on the items or store name.'),
});
export type ReceiptDetailsOutput = z.infer<typeof ReceiptDetailsOutputSchema>;

export async function extractReceiptDetails(input: ReceiptDetailsInput): Promise<ReceiptDetailsOutput> {
  return extractReceiptDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptDetailsPrompt',
  input: { schema: ReceiptDetailsInputSchema },
  output: { schema: ReceiptDetailsOutputSchema },
  prompt: `You are an expert at parsing receipts. Analyze the following receipt image and extract the total expense amount and determine the most appropriate category.

  Available categories are: ${EXPENSE_CATEGORIES.join(', ')}.

  Analyze the items, store name, and any other text to determine the best category. The amount should be the final total.

  Receipt:
  {{media url=receiptDataUri}}`,
});

const extractReceiptDetailsFlow = ai.defineFlow(
  {
    name: 'extractReceiptDetailsFlow',
    inputSchema: ReceiptDetailsInputSchema,
    outputSchema: ReceiptDetailsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Could not extract details from the receipt.");
    }
    return output;
  }
);
