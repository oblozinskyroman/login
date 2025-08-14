// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export type AskMeta = {
  page?: number;
  limit?: number;
  userLocation?: string;
  coords?: { lat: number; lng: number } | null;
  filters?: string[];
};

export type AskCard = {
  id?: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  verified?: boolean;
  rating?: number | null;
  tags?: string[];
  actions?: {
    call?: string | null;
    email?: string | null;
    website?: string | null;
    ctaLabel?: string;
  };
};

export type AskResult = {
  reply: string;
  cards: AskCard[];
  intent: any;
  meta: any;
};

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  meta: AskMeta = {}
): Promise<AskResult> {
  console.log('askAI: Vstupná meta:', meta);

  // DÔLEŽITÉ: meta posielame NAPLOCHO (edge function ich číta na top-level)
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature, ...meta },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  console.log('askAI: Dáta z Edge Function:', data);

  const intent = data?.intent ?? null;
  const metaOut = data?.meta ?? null;
  const cardsRaw = Array.isArray(data?.cards) ? data.cards : [];

  const cards: AskCard[] = cardsRaw.map((c: any) => {
    // Vyberieme lokalitu v tomto poradí: karta -> intent -> metaOut -> meta -> fallback pri coords
    const loc =
      (c?.location && String(c.location).trim()) ||
      (intent?.location && String(intent.location).trim()) ||
      (metaOut?.userLocation && String(metaOut.userLocation).trim()) ||
      (meta?.userLocation && String(meta.userLocation).trim()) ||
      ((metaOut?.coords || meta?.coords) ? 'Moje okolie' : '');

    console.log(`askAI: Spracovaná lokalita pre kartu "${c?.title}":`, loc);

    // Konverzia ratingu do čísla (alebo null)
    let rating: number | null = null;
    if (typeof c?.rating === 'number') {
      rating = c.rating;
    } else if (c?.rating != null) {
      const parsed = Number(c.rating);
      rating = Number.isFinite(parsed) ? parsed : null;
    }

    return {
      id: typeof c?.id === 'number' || typeof c?.id === 'string' ? c.id : undefined,
      title: String(c?.title ?? ''),
      subtitle: c?.subtitle ?? '',
      description: c?.description ?? '',
      location: loc || undefined,
      verified: Boolean(c?.verified),
      rating,
      tags: Array.isArray(c?.tags) ? c.tags : [],
      actions: c?.actions ?? {},
    };
  });

  return {
    reply: data?.reply ?? '',
    cards,
    intent,
    meta: metaOut,
  };
}
