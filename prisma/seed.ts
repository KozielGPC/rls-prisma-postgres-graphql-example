import { faker } from '@faker-js/faker';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
    const user: Prisma.UserCreateInput = {
      id: user_id,
      email: faker.internet.email(),
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

    return { organization, user, organization_manager, event };
  });

  await prisma.$transaction([
    prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
    prisma.organizationManager.deleteMany(),
    prisma.event.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.createMany({ data: data.map(d => d.organization) }),
    prisma.user.createMany({ data: data.flatMap(d => d.user) }),
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
