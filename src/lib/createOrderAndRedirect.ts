// createOrderAndRedirect.ts
export async function createOrderAndRedirect(companyId: string, amountCents: number, customerId?: string) {
  const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      company_id: companyId,
      amount: amountCents,
      customer_id: customerId ?? null,
      redirect_base: location.origin,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.checkout_url) throw new Error(json?.error || "Create order failed");
  location.href = json.checkout_url;
}