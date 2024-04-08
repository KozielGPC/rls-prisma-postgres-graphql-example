import { Injectable } from '@nestjs/common';
import {
  bypassPrisma,
  forOrganizationManager,
  prisma,
} from '../prisma/prisma-service';

@Injectable()
export class AppService {
  async returnManagerFromOneOrganization() {
    const organization = await bypassPrisma.organization.findFirstOrThrow();

    const organizationPrisma = prisma.$extends(
      forOrganizationManager(organization.id),
    );

    const organization_manager =
      await organizationPrisma.organizationManager.findMany();

    return organization_manager;
  }

  async returnManagerFromManyOrganizations() {
    const organization_managers =
      await bypassPrisma.organizationManager.findMany();

    return organization_managers;
  }

  async denyUpdateOrganizationThatIsNotManager() {
    const user = await bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      forOrganizationManager(organization_manager.organization_id),
    );

    const organization_to_be_updated =
      await bypassPrisma.organization.findFirstOrThrow({
        where: {
          id: {
            not: {
              equals: organization_manager.organization_id,
            },
          },
        },
      });
    return organizationPrisma.organization.update({
      where: {
        id: organization_to_be_updated.id,
      },
      data: {
        description: 'New Description',
      },
    });
  }

  async allowUpdateOrganizationThatIsNotManager() {
    const user = await bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      forOrganizationManager(organization_manager.organization_id),
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
    const user = await bypassPrisma.user.findFirstOrThrow();
    const organization_manager =
      await bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      forOrganizationManager(organization_manager.organization_id),
    );

    const event = await bypassPrisma.event.findFirstOrThrow({
      where: {
        organization_id: {
          not: {
            equals: organization_manager.organization_id,
          },
        },
      },
    });

    const eventupdate = await organizationPrisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        published: false,
      },
    });

    return eventupdate;
  }

  async allowUpdateEventFromOrganizationThatIsNotManager() {
    const user = await bypassPrisma.user.findFirstOrThrow();

    const organization_manager =
      await bypassPrisma.organizationManager.findFirstOrThrow({
        where: {
          reference_user_id: {
            equals: user.id,
          },
        },
      });

    const organizationPrisma = prisma.$extends(
      forOrganizationManager(organization_manager.organization_id),
    );

    const event = await bypassPrisma.event.findFirstOrThrow({
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

  async returnEvents() {
    return prisma.event.findMany({
      include: {
        organizer: {
          include: {
            events: true,
            organization_managers: true,
          },
        },
      },
    });
  }
}
