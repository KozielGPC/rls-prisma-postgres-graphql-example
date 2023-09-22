import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
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

  forOrganizationManager(organization_id: string, user_role: string) {
    return Prisma.defineExtension(prisma =>
      prisma.$extends({
        query: {
          $allModels: {
            async $allOperations({ args, query }) {
              const [, result] = await prisma.$transaction([
                prisma.$executeRaw`SELECT set_config('app.current_organization_id', ${organization_id}, TRUE), set_config('app.current_user_permission_id', ${user_role}, TRUE)`,
                // prisma.$executeRaw`SELECT set_config('app.current_user_permission_id', ${user_role}, TRUE)`,
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
      this.forOrganizationManager(organization.id, 'VIEWER')
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
    const user = await this.bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(
        organization_manager.organization_id,
        'ASDASD'
      )
    );

    const organization_to_be_updated =
      await this.bypassPrisma.organization.findFirstOrThrow({
        where: {
          id: {
            not: {
              equals: organization_manager.organization_id,
            },
          },
        },
      });

    const a = await organizationPrisma.organization.update({
      where: {
        id: organization_to_be_updated.id,
      },
      data: {
        description: 'New Description',
      },
    });

    console.log(a);

    return a;
  }

  async allowUpdateOrganizationThatIsNotManager() {
    const user = await this.bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(
        organization_manager.organization_id,
        'VIEWER'
      )
    );

    return organizationPrisma.organization.update({
      where: {
        id: organization_manager.organization_id,
      },
      data: {
        description: 'New Description',
      },
    });
  }

  async denyUpdateEventFromOrganizationThatIsNotManager() {
    const user = await this.bypassPrisma.organization.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(
        organization_manager.organization_id,
        'VIEWER'
      )
    );

    const event = await this.bypassPrisma.event.findFirstOrThrow({
      where: {
        organization_id: {
          not: {
            equals: organization_manager.organization_id,
          },
        },
      },
    });

    return organizationPrisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        published: false,
      },
    });
  }

  async allowUpdateEventFromOrganizationThatIsNotManager() {
    const user = await this.bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await this.bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      this.forOrganizationManager(
        organization_manager.organization_id,
        'VIEWER'
      )
    );

    const event = await this.bypassPrisma.event.findFirstOrThrow({
      where: {
        organization_id: organization_manager.organization_id,
      },
    });

    return organizationPrisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        published: false,
      },
    });
  }
}
