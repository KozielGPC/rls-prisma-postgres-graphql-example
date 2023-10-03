import { Module } from '@nestjs/common';
import { AppController } from './app.resolver';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DirectiveLocation, GraphQLDirective, GraphQLEnumType } from 'graphql';
import { authDirectiveTransformer } from './auth-directive';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './user.guard';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      context: ({ req }) => ({ headers: req.headers }),
      autoSchemaFile:
        process.env.NODE_ENV === 'development'
          ? join(process.cwd(), 'src/schema.gql')
          : true,
      transformSchema: (schema) => authDirectiveTransformer(schema),
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'auth',
            locations: [
              DirectiveLocation.OBJECT,
              DirectiveLocation.FIELD_DEFINITION,
            ],
            args: {
              requires: {
                type: new GraphQLEnumType({
                  name: 'ROLES',
                  values: {
                    ADMIN: { value: 'ADMIN' },
                    USER: { value: 'USER' },
                  },
                }),
              },
            },
          }),
        ],
      },
    }),
  ],
  providers: [
    AppService,
    AppController,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
