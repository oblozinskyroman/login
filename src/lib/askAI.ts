import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export type AskMeta = {
  page?: number;
  limit?: number;
  userLocation?: string;
  coords?: { lat: number; lng: number } | null;
  filters?: string[];
};

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  meta: AskMeta = {}
) {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature, meta },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  const reply = data?.reply ?? '';
  const intent = data?.intent ?? null;
  const metaOut = data?.meta ?? null;

  const intentLoc = (intent?.location ?? '').toString().trim();
  const userLoc  = (meta?.userLocation ?? '').toString().trim();
  const coordsLoc = meta?.coords ? 'Moje okolie' : '';

  const baseFallbackLoc = intentLoc || userLoc || coordsLoc;

  const rawCards = Array.isArray(data?.cards) ? data.cards : [];

  const cards = rawCards.map((c: any) => {
    const loc =
      (typeof c?.location === 'string' && c.location.trim())
        ? c.location.trim()
        : baseFallbackLoc || undefined;

    return { ...c, location: loc };
  });

  return { reply, cards, intent, meta: metaOut };
}
