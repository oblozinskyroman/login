// src/lib/askAI.ts
import { supabase } from './supabase';

export type ChatTurn = { role: 'user' | 'assistant' | 'system'; content: string };

type AskAIOpts = {
  page?: number;
  limit?: number;
  userLocation?: string;
  coords?: { lat: number; lng: number } | null;
  filters?: string[];
};

type AskAIResult = {
  reply: string;
  cards: any[];
  intent: any;
  meta: any;
};

const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const URL = `${BASE}/functions/v1/ai-assistant`;

/* ---------------- helpers ---------------- */

function extractArray(d: any): any[] {
  if (!d || typeof d !== 'object') return [];
  const keys = ['cards','results','items','list','records','matches','companies','providers','firms'];
  for (const k of keys) if (Array.isArray(d?.[k])) return d[k];
  if (d.data && typeof d.data === 'object') {
    for (const k of keys) if (Array.isArray(d.data[k])) return d.data[k];
    if (Array.isArray(d.data)) return d.data;
  }
  for (const [,v] of Object.entries(d)) if (Array.isArray(v)) return v as any[];
  return [];
}

function normalizeCard(x: any): any {
  const title =
    x?.title ?? x?.name ?? x?.company_name ?? x?.company ?? x?.displayName ?? 'Bez názvu';

  const subtitle =
    x?.subtitle ?? x?.category ?? x?.service ?? x?.specialization ?? x?.type ?? undefined;

  const description = x?.description ?? x?.about ?? x?.bio ?? x?.summary ?? undefined;

  const rating =
    (typeof x?.rating === 'number' ? x.rating : undefined) ??
    (typeof x?.stars === 'number' ? x.stars : undefined) ??
    (typeof x?.score === 'number' ? x.score : undefined) ??
    null;

  const verified = Boolean(x?.verified ?? x?.is_verified ?? x?.trusted ?? x?.isTrusted ?? false);

  // location – bez miešania ?? a ||
  const composedLoc = [x?.city, x?.district, x?.region, x?.country].filter(Boolean).join(', ');
  const location = (x?.location ?? (composedLoc ? composedLoc : undefined)) as string | undefined;

  const lat =
    x?.lat ?? x?.latitude ?? x?.geo?.lat ?? x?.geo_lat ??
    (Array.isArray(x?.location) ? x.location[0] : undefined);
  const lng =
    x?.lng ?? x?.longitude ?? x?.geo?.lng ?? x?.geo_lng ??
    (Array.isArray(x?.location) ? x.location[1] : undefined);
  const geo = (typeof lat === 'number' && typeof lng === 'number') ? { lat, lng } : null;

  const actions = {
    call: x?.phone ?? null,
    email: x?.email ?? null,
    website: x?.website ?? x?.url ?? null,
    ctaLabel: x?.ctaLabel ?? undefined,
  };

  return {
    id: x?.id ?? x?._id ?? x?.uuid ?? undefined,
    title, subtitle, description, location,
    rating, verified,
    tags: Array.isArray(x?.tags) ? x.tags : undefined,
    geo, distanceKm: null,
    actions,
  };
}

/* --- jednoduché textové porovnanie v kóde (žiadne .ilike) --- */
function matchesQuery(row: any, q: string): boolean {
  const s = (v: any) => (v ?? '').toString().toLowerCase();
  const joinArr = (a: any) => Array.isArray(a) ? a.map(s).join(' ') : '';
  const hay =
    s(row.title) + ' ' + s(row.name) + ' ' + s(row.company_name) + ' ' + s(row.company) + ' ' +
    s(row.description) + ' ' + s(row.about) + ' ' + joinArr(row.tags) + ' ' + joinArr(row.skills);
  return hay.includes(q.toLowerCase());
}

/* --- fallback: nenašiel karty z edge, skús DB (bez .ilike a bez pevných stĺpcov) --- */
async function searchCompaniesFallback(query: string, limit = 9): Promise<any[]> {
  const q = (query || '').trim();
  // ktoré názvy tabuliek skúsime
  const TABLES = ['companies', 'providers', 'firms', 'public_companies', 'service_providers'];

  const out: any[] = [];

  for (const tbl of TABLES) {
    try {
      // žiadne filtre – nechytáme 400 pri neexistujúcom stĺpci
      const { data, error } = await supabase.from(tbl).select('*').limit(50);
      if (error || !Array.isArray(data) || data.length === 0) continue;

      // filtrovanie spravíme lokálne
      const filtered = q ? data.filter((r) => matchesQuery(r, q)) : data;
      for (const row of filtered.slice(0, Math.max(limit - out.length, 0))) {
        out.push(normalizeCard(row));
      }
      if (out.length >= limit) break;
    } catch {
      // tabuľka nemusí existovať – ideme ďalej
    }
  }

  return out.slice(0, limit);
}

/* ---------------- main ---------------- */

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  opts: AskAIOpts = {}
): Promise<AskAIResult> {
  const payload = { message, history, temperature, ...opts };

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `AI request failed (${res.status})`;
    throw new Error(String(msg));
  }

  const reply = (data?.reply ?? data?.answer ?? data?.text ?? '') as string;

  let cards = extractArray(data).map(normalizeCard);

  if (cards.length === 0) {
    const fb = await searchCompaniesFallback(message, opts.limit ?? 9);
    if (fb.length) {
      cards = fb;
      console.debug('askAI: using DB fallback, results:', fb.length);
    }
  }

  const intent = (data?.intent ?? data?.meta?.intent ?? null) as any;

  const hasMore = Boolean(
    (data?.hasMore ?? data?.has_more ?? data?.meta?.hasMore ?? data?.meta?.has_more ?? false) as boolean
  );
  const meta = data?.meta ? { ...data.meta, hasMore } : { hasMore };

  console.debug('askAI: edge response:', data);
  console.debug('askAI: mapped ->', { reply, cardsLen: cards.length, meta });

  return { reply, cards, intent, meta };
}
