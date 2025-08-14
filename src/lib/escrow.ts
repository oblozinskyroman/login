import { supabase } from './supabase';

export type OrderStatus = 
  | 'draft' 
  | 'pending_payment' 
  | 'funds_held' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed' 
  | 'refunded' 
  | 'failed';

export interface Order {
  id: string;
  inquiry_id?: string;
  customer_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_intent_id?: string;
  checkout_session_id?: string;
  charge_id?: string;
  event_first?: any;
  event_latest?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  id: string;
}

export interface ReleaseEscrowResponse {
  ok: boolean;
}

export class EscrowService {
  static async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`customer_id.eq.${userId},provider_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Chyba pri načítavaní objednávok: ${error.message}`);
    }

    return data || [];
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Order not found
      }
      throw new Error(`Chyba pri načítavaní objednávky: ${error.message}`);
    }

    return data;
  }

  static async createCheckoutSession(orderId: string): Promise<CreateCheckoutSessionResponse> {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { order_id: orderId }
    });

    if (error) {
      throw new Error(`Chyba pri vytváraní platobnej session: ${error.message}`);
    }

    if (!data?.url) {
      throw new Error('Nepodarilo sa vytvoriť platobný odkaz');
    }

    return data;
  }

  static async releaseEscrowFunds(orderId: string): Promise<ReleaseEscrowResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Nie ste prihlásený');
    }

    const { data, error } = await supabase.functions.invoke('release-escrow-funds', {
      body: { order_id: orderId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      throw new Error(`Chyba pri uvoľňovaní prostriedkov: ${error.message}`);
    }

    return data || { ok: true };
  }

  static getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      draft: 'Návrh',
      pending_payment: 'Čaká na platbu',
      funds_held: 'Prostriedky v úschove',
      completed: 'Dokončené',
      cancelled: 'Zrušené',
      disputed: 'Sporné',
      refunded: 'Vrátené',
      failed: 'Neúspešné'
    };
    return labels[status] || status;
  }

  static getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_payment: 'bg-yellow-100 text-yellow-800',
      funds_held: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      disputed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  static formatAmount(amount: number, currency: string): string {
    const amountInUnits = amount / 100; // Convert from cents
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInUnits);
  }
}