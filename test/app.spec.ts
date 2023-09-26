import { AppService } from '../src/app.service';

describe('Tests', () => {
  const main = new AppService();
  it('should return one organization manager', async () => {
    const organiazation_manager = await main.returnManagerFromOneOrganization();

    expect(organiazation_manager).toHaveLength(1);
  });

  it('should return all organization manager', async () => {
    const organiazation_managers =
      await main.returnManagerFromManyOrganizations();

    expect(organiazation_managers).toHaveLength(100);
  });

  it('should throw error to update organization description due to user is not manager', async () => {
    await expect(
      main.denyUpdateOrganizationThatIsNotManager(),
    ).rejects.toThrow();
  });

  it('should allow to update organization description due to user is manager', async () => {
    const updated_organization =
      await main.allowUpdateOrganizationThatIsNotManager();
    expect(updated_organization).toHaveProperty(
      'description',
      'New Description',
    );
  });

  it('should throw error to update event from organization that user is not manager', async () => {
    await expect(
      main.denyUpdateEventFromOrganizationThatIsNotManager(),
    ).rejects.toThrow();
  });

  it('should allow to update event that user is manager', async () => {
    const updated_event =
      await main.allowUpdateEventFromOrganizationThatIsNotManager();
    expect(updated_event).toHaveProperty('published', false);
  });
});
