import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
});

const superPrisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
});

export class Main {
  bypassPrisma = superPrisma.$extends(this.bypassRLS());

  bypassRLS() {
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

  forOrganizationManager(organization_id: string) {
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

  async returnManagerFromOneOrganization() {
    const organization =
      await this.bypassPrisma.organization.findFirstOrThrow();

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(organization.id)
    );

    const organization_manager =
      await organizationPrisma.organizationManager.findMany();

    return organization_manager;
  }

  async returnManagerFromManyOrganizations() {
    const organization_managers =
      await this.bypassPrisma.organizationManager.findMany();

    return organization_managers;
  }

  async denyUpdateOrganizationThatIsNotManager() {
    const organization =
      await this.bypassPrisma.organization.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          organization_id: {
            not: {
              equals: organization.id,
            },
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(organization_manager.organization_id)
    );

    return organizationPrisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        description: 'New Description',
      },
    });
  }

  async allowUpdateOrganizationThatIsNotManager() {
    const organization =
      await this.bypassPrisma.organization.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          organization_id: {
              equals: organization.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(organization_manager.organization_id)
    );

    return organizationPrisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        description: 'New Description',
      },
    });
  }
}
