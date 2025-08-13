import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export type AskOptions = {
  page?: number;
  limit?: number;
  userLocation?: string;
};

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  options: AskOptions = {}
) {
  const { page = 0, limit = 9, userLocation = '' } = options;

  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature, page, limit, user_location: userLocation },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  return {
    reply: data?.reply ?? '',
    cards: data?.cards ?? [],
    intent: data?.intent ?? null,
    meta: data?.meta ?? { total: 0, page: 0, limit },
  };
}
