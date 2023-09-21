import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function bypassRLS() {
  return Prisma.defineExtension(prisma =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    })
  );
}

const bypassPrisma = prisma.$extends(bypassRLS());

function forOrganizationManager(organization_id: string) {
  return Prisma.defineExtension(prisma =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_organization_id', ${organization_id}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    })
  );
}

async function returnManagerFromOneOrganization() {
  const organization = await bypassPrisma.organization.findFirstOrThrow();

  const organizationPrisma = prisma.$extends(
    forOrganizationManager(organization.id)
  );

  const organization_manager =
    await organizationPrisma.organizationManager.findMany();

  console.log(organization_manager);
}

async function returnManagerFromManyOrganizations() {
  const organization_managers = await bypassPrisma.organizationManager.findMany(
    {
      take: 5,
    }
  );

  console.log(organization_managers);
}

async function main() {
  console.log(
    'Should Return One Organization Manager of Specific Organization'
  );

  await returnManagerFromOneOrganization();

  console.log('------------------------------------------');

  console.log('Should Return 5 Organization Managers');

  await returnManagerFromManyOrganizations().catch((err) => {
    console.log(err);
    throw err;
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
