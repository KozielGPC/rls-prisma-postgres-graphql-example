import { AppService } from './app.service';
import { Event } from 'prisma/@generated/event/event.model';
import { Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLResolveInfo } from 'graphql';

@Resolver()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Query(() => [Event])
  async getEvents(@Info() info: GraphQLResolveInfo): Promise<Event[]> {
    return this.appService.returnEvents();
  }
}
