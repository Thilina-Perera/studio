
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config({path: '.env'});

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1'})],
  model: 'googleai/gemini-2.5-flash-preview',
});
