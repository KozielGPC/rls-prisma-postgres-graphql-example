import { AppService } from './app.service';
import { Event } from 'prisma/@generated/event/event.model';
import { Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';
import { Roles } from './roles.decorator';
import { Role } from './users-role';

@Resolver()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Query(() => [Event])
  @Roles(Role.ADMIN)
  async getEvents(@Info() info: GraphQLResolveInfo): Promise<Event[]> {
    return this.appService.returnEvents();
  }
}
