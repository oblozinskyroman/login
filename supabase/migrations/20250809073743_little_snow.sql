/*
  # Create inquiries table

  1. New Tables
    - `inquiries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `title` (text)
      - `description` (text)
      - `service_type` (text)
      - `location` (text)
      - `budget` (text)
      - `status` (text, default 'open')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inquiries` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  service_type text,
  location text,
  budget text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own inquiries
CREATE POLICY "Users can read own inquiries"
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own inquiries
CREATE POLICY "Users can insert own inquiries"
  ON inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own inquiries
CREATE POLICY "Users can update own inquiries"
  ON inquiries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own inquiries
CREATE POLICY "Users can delete own inquiries"
  ON inquiries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);