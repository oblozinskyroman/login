// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export type AskMeta = {
  page?: number;
  limit?: number;
  userLocation?: string;
  coords?: { lat: number; lng: number } | null;
  /** rýchle filtre z UI (napr. 'verified', 'rating-4plus', ...) */
  filters?: string[];
};

type RawCard = Record<string, any>;

type UICard = {
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

function toNumberOrNull(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCard(c: RawCard): UICard {
  // --- titul/ID ---
  const id =
    c.id ??
    c.company_id ??
    c.uuid ??
    c.slug ??
    c.external_id ??
    c.title ??
    c.name ??
    undefined;

  const title = String(
    c.title ?? c.name ?? c.company_name ?? c.business_name ?? 'Neznáma firma'
  );

  const subtitle = c.subtitle ?? c.short_description ?? c.slogan ?? undefined;

  // --- popis ---
  const description =
    c.description ?? c.about ?? c.bio ?? c.long_description ?? undefined;

  // --- lokalita (skúsime poskladať z rôznych polí, ak chýba `location`) ---
  const city =
    c.city ??
    c.locality ??
    c.town ??
    c.mesto ??
    c.address?.city ??
    c.address_city ??
    c.geo?.city ??
    undefined;

  const region =
    c.region ??
    c.district ??
    c.kraj ??
    c.okres ??
    c.address?.region ??
    c.address_region ??
    c.geo?.region ??
    undefined;

  const fallbackLocation =
    c.address?.formatted ??
    c.address?.line1 ??
    c.address ??
    c.location_text ??
    undefined;

  const location =
    c.location ||
    [city, region].filter(Boolean).join(', ') ||
    fallbackLocation ||
    undefined;

  // --- verifikácia ---
  const verified = Boolean(
    c.verified ?? c.is_verified ?? (c.status && String(c.status).toLowerCase() === 'verified')
  );

  // --- rating ---
  const rating =
    toNumberOrNull(c.rating) ??
    toNumberOrNull(c.average_rating) ??
    toNumberOrNull(c.avg_rating) ??
    null;

  // --- tagy/služby ---
  const tags = Array.isArray(c.tags)
    ? c.tags
    : Array.isArray(c.services)
    ? c.services
    : undefined;

  // --- akcie/kontakty ---
  const actions = {
    call: c.call ?? c.phone ?? c.tel ?? c.contact_phone ?? null,
    email: c.email ?? c.contact_email ?? null,
    website: c.website ?? c.url ?? c.link ?? null,
    ctaLabel: c.ctaLabel ?? c.cta_label ?? undefined,
  };

  return { id, title, subtitle, description, location, verified, rating, tags, actions };
}

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

  const rawCards: RawCard[] = Array.isArray(data?.cards) ? data.cards : [];
  const cards: UICard[] = rawCards.map(normalizeCard);

  return {
    reply: (data?.reply as string) ?? '',
    cards,
    intent: data?.intent ?? null,
    meta: data?.meta ?? null,
  };
}
