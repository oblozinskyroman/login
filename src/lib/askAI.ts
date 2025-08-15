// src/lib/askAI.ts
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

const BASE = import.meta.env.VITE_SUPABASE_URL;         // napr. https://xxxx.supabase.co
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;     // public anon key
const URL = `${BASE}/functions/v1/ai-assistant`;

/** Pomocná funkcia – vyberie pole firiem z rôznych možných kľúčov */
function extractArray(d: any): any[] {
  if (!d || typeof d !== 'object') return [];
  // priame polia
  const directKeys = [
    'cards',
    'results',
    'items',
    'list',
    'records',
    'matches',
    'companies',
    'providers',
    'firms',
  ];
  for (const k of directKeys) {
    if (Array.isArray(d[k])) return d[k];
  }
  // často býva zabalené v "data"
  if (d.data && typeof d.data === 'object') {
    for (const k of directKeys) {
      if (Array.isArray(d.data[k])) return d.data[k];
    }
    if (Array.isArray(d.data)) return d.data;
  }
  // fallback: ak obsahuje jediné pole niekde na prvej úrovni
  for (const [_, v] of Object.entries(d)) {
    if (Array.isArray(v)) return v as any[];
  }
  return [];
}

/** Normalizácia na UICard tvar, ktorý očakáva UI */
function normalizeCard(x: any): any {
  const title =
    x?.title ??
    x?.name ??
    x?.company_name ??
    x?.company ??
    x?.displayName ??
    'Bez názvu';

  const subtitle = x?.subtitle ?? x?.category ?? x?.service ?? x?.specialization ?? x?.type ?? undefined;

  const description = x?.description ?? x?.about ?? x?.bio ?? x?.summary ?? undefined;

  const rating =
    (typeof x?.rating === 'number' ? x.rating : undefined) ??
    (typeof x?.stars === 'number' ? x.stars : undefined) ??
    (typeof x?.score === 'number' ? x.score : undefined) ??
    null;

  const verified = Boolean(
    x?.verified ?? x?.is_verified ?? x?.trusted ?? x?.isTrusted ?? false
  );

  const lat =
    x?.lat ??
    x?.latitude ??
    x?.geo?.lat ??
    (Array.isArray(x?.location) ? x.location[0] : undefined);
  const lng =
    x?.lng ??
    x?.longitude ??
    x?.geo?.lng ??
    (Array.isArray(x?.location) ? x.location[1] : undefined);
  const geo =
    typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;

  const amountCents =
    x?.amount_cents ??
    x?.price_cents ??
    (typeof x?.price === 'number' ? Math.round(x.price * 100) : undefined);

  const actions = {
    call: x?.phone ? `tel:${x.phone}` : null,
    email: x?.email ?? null,
    website: x?.website ?? x?.url ?? null,
    ctaLabel: x?.ctaLabel ?? undefined,
  };

  return {
    id: x?.id ?? x?._id ?? x?.uuid ?? undefined,
    title,
    subtitle,
    description,
    rating,
    verified,
    tags: Array.isArray(x?.tags) ? x.tags : undefined,
    geo,
    distanceKm: null,
    amountCents,
    actions,
  };
}

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
  try {
    data = await res.json();
  } catch {
    // nech to nespadne na zlom JSONe
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `AI request failed (${res.status})`;
    throw new Error(String(msg));
  }

  // Robustné mapovanie: backend niekedy posiela "answer" namiesto "reply"
  const reply =
    (data && (data.reply ?? data.answer ?? data.text ?? '')) || '';

  // Vytiahni firmy z rôznych možných kľúčov a znormalizuj do tvaru, ktorý UI vie zobraziť
  const rawArr = extractArray(data);
  const cards = rawArr.map(normalizeCard);

  const intent = (data && (data.intent ?? data.meta?.intent ?? null)) || null;

  const hasMore =
    Boolean(
      data?.hasMore ??
      data?.has_more ??
      data?.meta?.hasMore ??
      data?.meta?.has_more ??
      false
    );

  const meta = data?.meta ? { ...data.meta, hasMore } : { hasMore };

  // Pre ladenie
  console.debug('askAI: edge response:', data);
  console.debug('askAI: mapped ->', { reply, cardsLen: cards.length, meta });

  return { reply, cards, intent, meta };
}
