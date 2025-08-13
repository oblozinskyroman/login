// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** Volá Supabase Edge Function 'ai-assistant' (server spraví request na OpenAI). */
export async function askAI(message: string, history: ChatTurn[] = []) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature: 0.7, maxTokens: 400 },
  });

  if (error) {
    throw new Error(error.message || 'Nepodarilo sa získať odpoveď od AI');
  }
  return (data?.reply as string) ?? '';
}
