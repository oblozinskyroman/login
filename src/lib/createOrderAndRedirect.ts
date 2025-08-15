// src/lib/createOrderAndRedirect.ts
import { supabase } from './supabase';

/**
 * Vytvor objednávku na Supabase Edge Function `create-order`
 * a presmeruj používateľa na Stripe Checkout.
 *
 * @param companyId - ID firmy (z karty)
 * @param amountCents - suma v centoch (napr. 5000 = 50 €)
 */
export async function createOrderAndRedirect(companyId: string, amountCents: number) {
  // potrebujeme user token (musí byť prihlásený)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('NOT_AUTH');
  }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // dôležité: user access token, nie anon key
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        company_id: companyId,
        provider_id: companyId,          // pre istotu posielam oboje
        amount: amountCents,
        // ak máš v edge funkcii vlastné success/cancel, kľudne tieto polia vynechaj
        success_url: `${window.location.origin}/?order=success`,
        cancel_url: `${window.location.origin}/?order=cancel`,
        currency: 'eur',
      }),
    }
  );

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || 'create-order failed');
  }

  const url = json?.checkout_url || json?.url;
  if (!url) {
    throw new Error('No checkout URL returned from create-order');
  }

  window.location.href = url;
}
