/*
  # Create orders table for Escrow system

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `inquiry_id` (uuid, optional reference to inquiries)
      - `customer_id` (uuid, required - user who pays)
      - `provider_id` (uuid, required - user who provides service)
      - `amount` (int8, required - amount in cents)
      - `currency` (text, default 'usd')
      - `status` (order_status enum, default 'pending_payment')
      - `payment_intent_id` (text, unique - Stripe payment intent ID)
      - `checkout_session_id` (text, unique - Stripe checkout session ID)
      - `charge_id` (text - Stripe charge ID)
      - `event_first` (jsonb - first Stripe event received)
      - `event_latest` (jsonb - latest Stripe event received)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `orders` table
    - Add policy for users to read their own orders (as customer or provider)
    - Add policy for users to update their own orders (as customer)

  3. Enums
    - Create `order_status` enum with values: 'draft', 'pending_payment', 'funds_held', 'completed', 'cancelled', 'disputed', 'refunded', 'failed'
*/

-- Create enum for order status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'draft',
      'pending_payment', 
      'funds_held',
      'completed',
      'cancelled',
      'disputed',
      'refunded',
      'failed'
    );
  END IF;
END$$;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  amount int8 NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'usd',
  status public.order_status NOT NULL DEFAULT 'pending_payment',
  payment_intent_id text UNIQUE,
  checkout_session_id text UNIQUE,
  charge_id text,
  event_first jsonb,
  event_latest jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON public.orders (provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_pi ON public.orders (payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_cs ON public.orders (checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- Add foreign key constraints (optional - depends on your profiles table structure)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Add foreign key constraints if profiles table exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'orders_customer_id_fkey'
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_customer_id_fkey 
      FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'orders_provider_id_fkey'
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_provider_id_fkey 
      FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END$$;

-- Add foreign key constraint for inquiries if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inquiries') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'orders_inquiry_id_fkey'
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_inquiry_id_fkey 
      FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
    END IF;
  END IF;
END$$;

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = customer_id OR auth.uid() = provider_id
  );

CREATE POLICY "Customers can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
  );

CREATE POLICY "Customers can update own orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = customer_id
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_orders_updated_at ON public.orders;
CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();