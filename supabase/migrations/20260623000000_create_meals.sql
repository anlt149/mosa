CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_type TEXT NOT NULL CHECK (location_type IN ('eat_out', 'eat_home')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Select policy: users can only see their own meals
CREATE POLICY "Users can view their own meals" ON meals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert policy: users can only insert their own meals
CREATE POLICY "Users can insert their own meals" ON meals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Update policy: users can only update their own meals
CREATE POLICY "Users can update their own meals" ON meals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Delete policy: users can only delete their own meals
CREATE POLICY "Users can delete their own meals" ON meals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
