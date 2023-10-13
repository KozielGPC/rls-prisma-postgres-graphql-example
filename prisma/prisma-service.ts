import { Prisma, PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const superPrisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
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
    }),
  );
}

export const bypassPrisma = superPrisma.$extends(bypassRLS());

export function forOrganizationManager(organization_id: string) {
  return Prisma.defineExtension((prisma) =>
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
    }),
  );
}
