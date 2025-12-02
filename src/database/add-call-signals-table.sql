-- Add call_signals table for WebRTC signaling
-- Run this in your Supabase SQL Editor

-- Drop existing table and related objects if they exist
DROP TABLE IF EXISTS call_signals CASCADE;

CREATE TABLE call_signals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id uuid REFERENCES call_logs(id) ON DELETE CASCADE,
  caller_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  team_id uuid REFERENCES emergency_teams,
  type text NOT NULL CHECK (type IN ('offer', 'answer', 'ice-candidate', 'end-call')),
  signal jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- Policies for call_signals
CREATE POLICY "Users can view signals for their calls"
  ON call_signals FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert signals for their calls"
  ON call_signals FOR INSERT
  WITH CHECK (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create index for faster queries
DROP INDEX IF EXISTS idx_call_signals_call_id;
DROP INDEX IF EXISTS idx_call_signals_created_at;
CREATE INDEX idx_call_signals_call_id ON call_signals(call_id);
CREATE INDEX idx_call_signals_created_at ON call_signals(created_at DESC);

-- Enable realtime for call_signals
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;

-- Add online status tracking for admins
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Add unique constraint on name if it doesn't exist
DROP INDEX IF EXISTS emergency_teams_name_unique;
ALTER TABLE emergency_teams ADD CONSTRAINT emergency_teams_name_unique UNIQUE (name);

-- Seed emergency teams data (only insert if not exists)
INSERT INTO emergency_teams (name, type, location, lat, lng, hotline)
SELECT * FROM (VALUES
  ('Malaybalay City Police Station', 'police', 'Malaybalay City, Bukidnon', 8.1536, 125.1279, '(088) 221-3344'),
  ('Valencia City Police Station', 'police', 'Valencia City, Bukidnon', 7.9067, 125.0939, '(088) 828-1234'),
  ('Manolo Fortich Police Station', 'police', 'Manolo Fortich, Bukidnon', 8.3667, 124.8667, '(088) 356-1234'),
  ('Quezon Municipal Police Station', 'police', 'Quezon, Bukidnon', 7.7333, 125.1000, '(088) 310-5678'),
  ('Don Carlos Police Station', 'police', 'Don Carlos, Bukidnon', 7.6833, 125.0000, '(088) 356-7890'),

  ('Malaybalay City Fire Station', 'fire', 'Malaybalay City, Bukidnon', 8.1500, 125.1300, '(088) 221-2345'),
  ('Valencia City Fire Station', 'fire', 'Valencia City, Bukidnon', 7.9100, 125.0950, '(088) 828-3456'),
  ('Manolo Fortich Fire Station', 'fire', 'Manolo Fortich, Bukidnon', 8.3700, 124.8700, '(088) 356-4567'),
  ('Maramag Fire Station', 'fire', 'Maramag, Bukidnon', 7.7667, 125.0167, '(088) 221-5678'),
  ('Lantapan Fire Station', 'fire', 'Lantapan, Bukidnon', 7.9833, 125.0333, '(088) 356-6789'),

  ('Bukidnon Provincial Rescue Team', 'rescue', 'Malaybalay City, Bukidnon', 8.1550, 125.1250, '(088) 221-4567'),
  ('Valencia City Rescue Unit', 'rescue', 'Valencia City, Bukidnon', 7.9050, 125.0920, '(088) 828-5678'),
  ('Manolo Fortich Emergency Response', 'rescue', 'Manolo Fortich, Bukidnon', 8.3650, 124.8650, '(088) 356-7891'),
  ('Quezon Municipal Rescue', 'rescue', 'Quezon, Bukidnon', 7.7350, 125.0980, '(088) 310-6789'),
  ('Sumilao Emergency Team', 'rescue', 'Sumilao, Bukidnon', 8.2833, 124.9500, '(088) 221-7890'),
  ('Impasugong Rescue Unit', 'rescue', 'Impasugong, Bukidnon', 8.3000, 125.0000, '(088) 356-8901'),
  ('Libona Emergency Response', 'rescue', 'Libona, Bukidnon', 8.3333, 124.7333, '(088) 221-9012'),
  ('Talakag Rescue Team', 'rescue', 'Talakag, Bukidnon', 8.2333, 124.6000, '(088) 356-0123'),

  ('CDRRMO Valencia', 'rescue', 'Valencia City, Bukidnon', 7.930789359108319, 125.09803547110613, '(088) 828-9999'),
  ('MDRRMC Pangantucan', 'rescue', 'Pangantucan, Bukidnon', 7.828728554466357, 124.82813288569363, '(088) 356-8888'),
  ('Adtuyon Rescue Outpost', 'rescue', 'Pangantucan, Bukidnon', 7.815833528296667, 124.85540567191764, '(088) 356-7777')
) AS v(name, type, location, lat, lng, hotline)
WHERE NOT EXISTS (
  SELECT 1 FROM emergency_teams WHERE emergency_teams.name = v.name
);

-- Update online status when admin logs in
DROP FUNCTION IF EXISTS update_admin_online_status() CASCADE;
CREATE OR REPLACE FUNCTION update_admin_online_status()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_type = 'admin' THEN
    UPDATE profiles SET is_online = true, last_seen = now() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set admin online when they authenticate
DROP TRIGGER IF EXISTS on_auth_user_created_update_admin_status ON auth.users;
CREATE TRIGGER on_auth_user_created_update_admin_status
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION update_admin_online_status();

-- Function to set admin offline (call this when admin logs out or disconnects)
DROP FUNCTION IF EXISTS set_admin_offline(uuid) CASCADE;
CREATE OR REPLACE FUNCTION set_admin_offline(admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET is_online = false, last_seen = now() WHERE id = admin_id AND user_type = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix Row Level Security policies for profiles table
-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Create a function to handle new user profile creation
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type, team)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'team'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also allow service role to insert profiles
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');