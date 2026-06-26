-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  task_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for daily_tasks
CREATE POLICY "Users can manage their own daily tasks" ON daily_tasks
  FOR ALL TO authenticated USING (auth.uid() = user_id);
