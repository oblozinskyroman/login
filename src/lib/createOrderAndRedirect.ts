import { supabase } from "./supabase";

export async function createOrderAndRedirect(companyId: string, amountCents: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Musíte byť prihlásený.");

  const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ company_id: companyId, amount: amountCents, currency: "eur" }),
  });

  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out?.error || "create-order failed");

  if (out.checkout_url) window.location.href = out.checkout_url;
  return out;
}
