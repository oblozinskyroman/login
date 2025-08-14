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
    geo?: { lat: number; lng: number } | null;
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
  // dôležité: meta posielame naplocho – edge function ich číta na top-level
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: { message, history, temperature, ...meta },
  });

  if (error) {
    console.error('invoke error:', error);
    throw new Error('Nepodarilo sa zavolať Edge Function');
  }

  const intent = data?.intent ?? null;
  const metaOut = data?.meta ?? null;
  const cardsRaw = Array.isArray(data?.cards) ? data.cards : [];

  const cards = cardsRaw.map((c: any) => {
    // prevezmi polohu ak ju server poslal
    let geo: { lat: number; lng: number } | null = null;
    const lat =
      c?.lat ?? c?.latitude ?? c?.geo_lat ?? c?.location_lat ?? c?.coords?.lat ?? null;
    const lng =
      c?.lng ?? c?.longitude ?? c?.geo_lng ?? c?.location_lng ?? c?.coords?.lng ?? null;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      geo = { lat: Number(lat), lng: Number(lng) };
    }

    const rating =
      typeof c?.rating === 'number' ? c.rating : (c?.rating != null ? Number(c.rating) : null);

    return {
      id: (typeof c?.id === 'number' || typeof c?.id === 'string') ? c.id : undefined,
      title: String(c?.title ?? ''),
      subtitle: c?.subtitle ?? '',
      description: c?.description ?? '',
      location: (c?.location && String(c.location).trim()) || undefined,
      verified: Boolean(c?.verified),
      rating: Number.isFinite(rating as number) ? (rating as number) : null,
      tags: Array.isArray(c?.tags) ? c.tags : [],
      geo,
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
