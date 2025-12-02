-- Add call_signals table for WebRTC signaling
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS call_signals (
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
CREATE INDEX idx_call_signals_call_id ON call_signals(call_id);
CREATE INDEX idx_call_signals_created_at ON call_signals(created_at DESC);

-- Enable realtime for call_signals
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;
