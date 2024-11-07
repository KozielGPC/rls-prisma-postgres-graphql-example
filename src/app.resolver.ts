import { AppService } from './app.service';
import { Event } from 'prisma/@generated/event/event.model';
import { Context, Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Roles } from './roles.decorator';
import { Role } from './users-role';
import { Req } from '@nestjs/common';

@Resolver()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Query(() => [Event])
  @Roles(Role.ADMIN)
  async getEvents(@Info() info: GraphQLResolveInfo): Promise<Event[]> {
    return this.appService.returnEvents();
  }

  @Query(() => [Event])
  @Roles(Role.ADMIN)
  async getEventsForOrganizationManager(
    @Info() info: GraphQLResolveInfo,
    @Context() context
  ): Promise<Event[]> {
    const organization_id = context.headers.organization_id
    console.log('organization_id: ', organization_id);
    
    return this.appService.returnEventsForOrganizationManager(organization_id);
  }
}
