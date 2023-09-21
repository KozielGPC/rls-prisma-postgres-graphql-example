-- Enable Row Level Security
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_managers" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "organization_managers" FORCE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "organizations" USING ("id" = current_setting('app.current_organization_id', TRUE)::uuid);
CREATE POLICY tenant_isolation_policy ON "organization_managers" USING ("organization_id" = current_setting('app.current_organization_id', TRUE)::uuid);

-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "organizations" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
CREATE POLICY bypass_rls_policy ON "organization_managers" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');