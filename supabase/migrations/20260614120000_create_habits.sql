-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- HEX color code
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security on habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for habits
CREATE POLICY "Users can manage their own habits" ON habits
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create habit logs (check-ins) table
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, log_date)
);

-- Enable Row-Level Security on habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for habit logs
CREATE POLICY "Users can manage their own habit logs" ON habit_logs
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()
    )
  );
