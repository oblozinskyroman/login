import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7
) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  // Teraz vraciame aj cards
  return {
    reply: data?.reply ?? '',
    cards: data?.cards ?? [],
    intent: data?.intent ?? null
  };
}
