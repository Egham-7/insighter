import { openai } from '@ai-sdk/openai';

export const openaiClient = openai;

export const openaiConfig = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  max_tokens: 1000,
}; 