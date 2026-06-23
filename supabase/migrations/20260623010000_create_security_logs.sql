CREATE TABLE upload_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast counting
CREATE INDEX idx_upload_requests_user_time ON upload_requests(user_id, created_at);

CREATE TABLE admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for checking recent alerts
CREATE INDEX idx_admin_alerts_type_time ON admin_alerts(alert_type, created_at);

-- Both of these tables are only for backend Edge Functions using the service role key,
-- or authenticated users but users should NOT be able to select from them directly.
-- Let's enable RLS and just not create any public policies.
ALTER TABLE upload_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
CREATE POLICY "Users can log their own requests" ON upload_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Wait, the edge function uses the user's session token to act on their behalf (RLS applies).
-- So the edge function needs to be able to SELECT to count.
CREATE POLICY "Users can count their own requests" ON upload_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- For admin_alerts, the user also needs to insert and select, since the edge function 
-- runs as the user.
CREATE POLICY "Users can insert their own alerts" ON admin_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own alerts" ON admin_alerts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
