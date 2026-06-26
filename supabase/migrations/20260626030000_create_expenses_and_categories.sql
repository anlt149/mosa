-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  monthly_budget INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expense categories" ON expense_categories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expense categories" ON expense_categories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense categories" ON expense_categories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense categories" ON expense_categories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Modify fixed_costs to optionally link to a category
ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL;

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  fixed_cost_id UUID REFERENCES fixed_costs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Migrate data from cost_records to expenses
DO $$ 
DECLARE
  rec RECORD;
  fc_name TEXT;
  expense_date DATE;
BEGIN
  FOR rec IN SELECT * FROM cost_records WHERE is_paid = true LOOP
    SELECT name INTO fc_name FROM fixed_costs WHERE id = rec.fixed_cost_id;
    -- convert month_key 'YYYY-MM' to date 'YYYY-MM-01'
    expense_date := (rec.month_key || '-01')::DATE;
    
    INSERT INTO expenses (id, user_id, fixed_cost_id, name, amount, log_date, created_at)
    VALUES (rec.id, rec.user_id, rec.fixed_cost_id, fc_name, COALESCE(rec.actual_amount, 0), expense_date, rec.created_at)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Drop cost_records table as it is now replaced by expenses
DROP TABLE IF EXISTS cost_records;
