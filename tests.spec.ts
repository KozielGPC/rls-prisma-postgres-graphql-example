import { Main } from './main';

describe('Tests', () => {
  let main = new Main();
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
      main.denyUpdateOrganizationThatIsNotManager()
    ).rejects.toThrow();
  });

  it('should allow to update organization description due to user is not manager', async () => {
    const updated_organization = await main.allowUpdateOrganizationThatIsNotManager();
    expect(updated_organization).toHaveProperty('description', 'New Description');
  });
});
