// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export async function askAI(message: string, history: ChatTurn[] = []): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history }, // presne to očakáva naša Edge Function
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(error.message || 'Edge Function invoke failed');
  }

  // supabase-js môže vrátiť string alebo objekt (podľa verzie/runtime)
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed?.reply ?? '';
    } catch {
      return data;
    }
  }
  return data?.reply ?? '';
}
