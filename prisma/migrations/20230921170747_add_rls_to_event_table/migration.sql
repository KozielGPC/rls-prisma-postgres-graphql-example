-- Enable Row Level Security
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "events" USING ("organization_id" = current_setting('app.current_organization_id', TRUE)::uuid);

-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "events" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');