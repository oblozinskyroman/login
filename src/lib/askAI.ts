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

const BASE = import.meta.env.VITE_SUPABASE_URL; // napr. https://xxxx.supabase.co
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const URL = `${BASE}/functions/v1/ai-assistant`;

export async function askAI(
  message: string,
  history: ChatTurn[] = [],
  temperature = 0.7,
  opts: AskAIOpts = {}
): Promise<AskAIResult> {
  const payload = {
    message,
    history,
    temperature,
    ...opts,
  };

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
    // nech nepadne na zlom JSONe
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `AI request failed (${res.status})`;
    throw new Error(String(msg));
  }

  // 💡 robustné mapovanie podľa toho, čo vracia edge function
  const reply =
    (data && (data.reply ?? data.answer ?? data.text ?? '')) || '';

  const cards =
    (data && (Array.isArray(data.cards) ? data.cards : Array.isArray(data.results) ? data.results : [])) || [];

  const intent = (data && (data.intent ?? data.meta?.intent ?? null)) || null;

  const meta =
    (data && (data.meta ?? { hasMore: Boolean(data.hasMore) })) || { hasMore: false };

  return { reply, cards, intent, meta };
}
