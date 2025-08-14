// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

export type AskMeta = {
  page?: number;
  limit?: number;
  userLocation?: string;
  coords?: { lat: number; lng: number } | null;
  filters?: string[]; // rýchle filtre z UI
};

type RawCard = Record<string, any>;

export type UICard = {
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

/* ---------- utils ---------- */
function toNumberOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
}

// bezpečné čítanie z hĺbky: get(obj, ["company","address","city"])
function getDeep(obj: any, path: string[]): any {
  return path.reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}

// vráť prvú nenull/neidenú hodnotu z viacerých (vrátane deep ciest "address.city")
function pickFirst(obj: any, paths: (string | string[])[]): any {
  for (const p of paths) {
    const val =
      Array.isArray(p) ? getDeep(obj, p) :
      p.includes('.')   ? getDeep(obj, p.split('.')) :
      (obj ? obj[p] : undefined);
    if (val != null && String(val).trim() !== '') return val;
  }
  return undefined;
}

/* ---------- normalizácia karty z backendu ---------- */
function normalizeCard(c: RawCard): UICard {
  // ID
  const id = pickFirst(c, [
    'id', 'company_id', 'uuid', 'slug', 'external_id',
    'title', 'name', 'company.name'
  ]);

  // Title
  const title = String(
    pickFirst(c, [
      'title', 'name', 'company_name', 'business_name',
      ['company', 'name']
    ]) ?? 'Neznáma firma'
  );

  // Subtitle & Popis
  const subtitle = pickFirst(c, ['subtitle', 'short_description', 'slogan', ['company', 'slogan']]);
  const description = pickFirst(c, [
    'description', 'about', 'bio', 'long_description',
    ['company', 'description']
  ]);

  // Lokalita – pokryjeme čo najviac variantov
  const city = pickFirst(c, [
    'city', 'city_name', 'locality', 'town', 'mesto', 'obec', 'municipality',
    'address.city', ['address', 'city'],
    'geo.city', ['geo', 'city'],
    'company.city', ['company', 'city'],
  ]);

  const region = pickFirst(c, [
    'region', 'region_name', 'district', 'okres', 'kraj', 'county', 'state', 'province',
    'address.region', ['address', 'region'],
    'geo.region', ['geo', 'region'],
    'company.region', ['company', 'region'],
  ]);

  const formattedAddress = pickFirst(c, [
    'address.formatted', ['address', 'formatted'],
    'address.line1', ['address', 'line1'],
    'address', 'location_text',
  ]);

  const location =
    pickFirst(c, ['location', 'location_text']) ||
    [city, region].filter(Boolean).join(', ') ||
    formattedAddress ||
    undefined;

  // Overenie
  const verified = Boolean(
    pickFirst(c, ['verified', 'is_verified']) ??
    (String(pickFirst(c, ['status', 'company.status']) ?? '').toLowerCase() === 'verified')
  );

  // Rating
  const rating =
    toNumberOrNull(pickFirst(c, ['rating', 'average_rating', 'avg_rating', ['company', 'average_rating']])) ?? null;

  // Tagy/služby
  const tagsRaw = pickFirst(c, ['tags', 'services', ['company', 'services']]);
  const tags = Array.isArray(tagsRaw) ? tagsRaw : undefined;

  // Kontakty
  const actions = {
    call: pickFirst(c, ['call', 'phone', 'tel', 'contact_phone', ['company', 'phone']]) ?? null,
    email: pickFirst(c, ['email', 'contact_email', ['company', 'email']]) ?? null,
    website: pickFirst(c, ['website', 'url', 'link', ['company', 'website']]) ?? null,
    ctaLabel: pickFirst(c, ['ctaLabel', 'cta_label']) ?? undefined,
  };

  return { id, title, subtitle, description, location, verified, rating, tags, actions };
}

/* ---------- hlavná funkcia ---------- */
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
