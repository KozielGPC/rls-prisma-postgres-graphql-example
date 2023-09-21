-- AlterTable
ALTER TABLE "organization_managers" ALTER COLUMN "organization_id" SET DEFAULT (current_setting('app.current_organization_id'::text))::uuid;
