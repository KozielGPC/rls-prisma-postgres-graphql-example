-- Enable Row Level Security
ALTER TABLE "user_has_user_roles" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "user_has_user_roles" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy 
  ON "user_has_user_roles" 
  USING (
    EXISTS (
      SELECT 1
      FROM unnest(string_to_array(current_setting('app.current_user_permissions', TRUE), ',')) AS user_role
      WHERE user_role = "role_id"
    )
  );

-- Create policies to bypass RLS (optional)
CREATE POLICY bypass_rls_policy ON "user_has_user_roles" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
