CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INT2 NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  energy_level INT2 NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate logs per user per day
CREATE UNIQUE INDEX unique_user_daily_log ON daily_logs (user_id, log_date);

-- Enable RLS
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Select policy: users can only see their own logs
CREATE POLICY "Users can view their own logs" ON daily_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert policy: users can only insert their own logs
CREATE POLICY "Users can insert their own logs" ON daily_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update policy: users can only update their own logs
CREATE POLICY "Users can update their own logs" ON daily_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Delete policy: users can only delete their own logs
CREATE POLICY "Users can delete their own logs" ON daily_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
