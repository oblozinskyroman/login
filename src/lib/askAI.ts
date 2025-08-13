import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function askAI(message: string, history: ChatTurn[] = []) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature: 0.7, maxTokens: 400 },
  });

  if (error) throw new Error(error.message || 'Failed to send a request to the Edge Function');
  return (data?.reply as string) ?? '';
}
