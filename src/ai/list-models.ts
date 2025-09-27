
'use server';

import { GoogleGenerativeAI } from "@google/genai";
import { config } from 'dotenv';
config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Your API key has access to the following models:");
    for (const model of models) {
        // We only care about the models that support content generation
        if (model.supportedGenerationMethods.includes('generateContent')) {
            console.log(`- ${model.name}`);
        }
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
