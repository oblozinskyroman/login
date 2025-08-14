/*
  # Add missing Escrow columns to orders table

  1. New Columns
    - `checkout_session_id` (text, nullable) - Stripe Checkout Session ID
    - `payment_intent_id` (text, nullable) - Stripe Payment Intent ID  
    - `charge_id` (text, nullable) - Stripe Charge ID
    - `event_first` (jsonb, nullable) - First Stripe webhook event
    - `event_latest` (jsonb, nullable) - Latest Stripe webhook event

  2. Changes
    - Add missing columns to support Stripe payment processing
    - All columns are nullable to support existing data
    - JSONB columns for storing Stripe webhook event data

  3. Notes
    - This migration fixes the "column does not exist" error
    - Supports both test and live Stripe environments
*/

-- Add missing Stripe-related columns to orders table
DO $$
BEGIN
  -- Add checkout_session_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'checkout_session_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN checkout_session_id text;
  END IF;

  -- Add payment_intent_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN payment_intent_id text;
  END IF;

  -- Add charge_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'charge_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN charge_id text;
  END IF;

  -- Add event_first column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'event_first'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN event_first jsonb;
  END IF;

  -- Add event_latest column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'event_latest'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN event_latest jsonb;
  END IF;
END $$;

-- Create orders table if it doesn't exist (fallback)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'draft',
  checkout_session_id text,
  payment_intent_id text,
  charge_id text,
  event_first jsonb,
  event_latest jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add status constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('draft', 'pending_payment', 'funds_held', 'completed', 'cancelled', 'disputed', 'refunded', 'failed'));
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Customer foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Provider foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_provider_id_fkey'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_provider_id_fkey 
    FOREIGN KEY (provider_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Inquiry foreign key (optional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_inquiry_id_fkey'
  ) THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_inquiry_id_fkey 
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Policy for customers to see their orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Customers can view their orders'
  ) THEN
    CREATE POLICY "Customers can view their orders"
      ON public.orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = customer_id);
  END IF;

  -- Policy for providers to see their orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Providers can view their orders'
  ) THEN
    CREATE POLICY "Providers can view their orders"
      ON public.orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = provider_id);
  END IF;

  -- Policy for customers to update their orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Customers can update their orders'
  ) THEN
    CREATE POLICY "Customers can update their orders"
      ON public.orders
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = customer_id);
  END IF;

  -- Policy for service role to manage all orders (for webhooks)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Service role can manage all orders'
  ) THEN
    CREATE POLICY "Service role can manage all orders"
      ON public.orders
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_provider_id_idx ON public.orders(provider_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_checkout_session_id_idx ON public.orders(checkout_session_id);
CREATE INDEX IF NOT EXISTS orders_payment_intent_id_idx ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);