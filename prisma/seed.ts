import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      id: 'ADMIN',
      name: 'Admin',
    },
    {
      id: 'VIEWER',
      name: 'Viewer',
    },
  ];
  // Create 100 organizations
  const data = Array.from({ length: 100 }, () => {
    // Create organization
    const organization_id = faker.string.uuid();
    const organization_name = faker.company.name();
    const organization: Prisma.OrganizationCreateInput = {
      id: organization_id,
      name: organization_name,
      description: faker.lorem.sentence(),
      short_name: faker.company.name(),
    };

    // Create user manager
    const user_id = faker.string.uuid();
    const user: Prisma.UserUncheckedCreateInput = {
      id: user_id,
      email: faker.internet.email(),
      user_role_id: roles[0].id,
    };

    // Create user viewer
    const user_viewer_id = faker.string.uuid();
    const user_viewer: Prisma.UserUncheckedCreateInput = {
      id: user_viewer_id,
      email: faker.internet.email(),
      user_role_id: roles[1].id,
    };


    // Create organization manager
    const organization_manager: Prisma.OrganizationManagerUncheckedCreateInput =
      {
        reference_user_id: user_id,
        organization_id: organization_id,
      };

    // Create event
    const event: Prisma.EventUncheckedCreateInput = {
      id: faker.string.uuid(),
      name: `Event from ${organization_name}`,
      description: faker.lorem.sentence(),
      organization_id: organization_id,
      slug: 'event-from-' + organization_name,
    };

    return { organization, user, organization_manager, event, user_viewer };
  });

  await prisma.$transaction([
    prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
    prisma.organizationManager.deleteMany(),
    prisma.event.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.createMany({ data: data.map(d => d.organization) }),
    prisma.userRole.createMany({ data: roles}),
    prisma.user.createMany({ data: data.flatMap(d => d.user) }),
    prisma.user.createMany({ data: data.flatMap(d => d.user_viewer) }),
    prisma.organizationManager.createMany({
      data: data.flatMap(d => d.organization_manager),
    }),
    prisma.event.createMany({
      data: data.flatMap(d => d.event),
    }),
  ]);

  console.log(`Database has been seeded. 🌱`);
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
