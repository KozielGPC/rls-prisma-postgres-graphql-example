-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(100),
    "description" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_managers" (
    "reference_user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL DEFAULT (current_setting('app.current_organization_id'::text))::uuid,

    CONSTRAINT "organization_managers_pkey" PRIMARY KEY ("reference_user_id","organization_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "organization_managers" ADD CONSTRAINT "organization_managers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
