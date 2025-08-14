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

export type AskResult = {
  reply: string;
  cards: Array<{
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
  }>;
  intent: any;
  meta: any;
};

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  meta: AskMeta = {}
): Promise<AskResult> {
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature, meta },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  const intent = data?.intent ?? null;
  const metaOut = data?.meta ?? null;
  const cardsRaw = Array.isArray(data?.cards) ? data.cards : [];

  const cards = cardsRaw.map((c: any) => {
    // Fallback poradie pre lokalitu:
    const loc =
      (c?.location && String(c.location).trim()) ||
      (intent?.location && String(intent.location).trim()) ||
      (metaOut?.userLocation && String(metaOut.userLocation).trim()) ||
      (meta?.userLocation && String(meta.userLocation).trim()) ||
      (metaOut?.coords || meta?.coords ? 'Moje okolie' : '');

    // Normalizácie
    const rating =
      typeof c?.rating === 'number' ? c.rating : (c?.rating != null ? Number(c.rating) : null);
    const id =
      typeof c?.id === 'number' || typeof c?.id === 'string' ? c.id : undefined;

    return {
      id,
      title: String(c?.title ?? ''),
      subtitle: c?.subtitle ?? '',
      description: c?.description ?? '',
      location: loc || undefined,
      verified: Boolean(c?.verified),
      rating: Number.isFinite(rating as number) ? (rating as number) : null,
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
