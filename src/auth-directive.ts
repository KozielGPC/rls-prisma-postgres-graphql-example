import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function authDirective(
  directiveName: string,
  getUserFn: (token: string) => { hasRole: (role: string) => boolean },
) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    authDirectiveTypeDefs: `directive @${directiveName}(
        requires: Role = ADMIN,
      ) on OBJECT | FIELD_DEFINITION
   
      enum Role {
        ADMIN
        REVIEWER
        USER
        UNKNOWN
      }`,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          if (authDirective) {
            const { requires } = authDirective;
            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;
              fieldConfig.resolve = function (source, args, context, info) {
                const user = getUserFn(context.headers.authToken);
                if (!user.hasRole(requires)) {
                  throw new Error('not authorized');
                }
                return resolve(source, args, context, info);
              };
              return fieldConfig;
            }
          }
        },
      }),
  };
}

export function getUser(token: string) {
  console.log(token);

  const roles = ['UNKNOWN', 'USER', 'REVIEWER', 'ADMIN'];
  return {
    hasRole: (role: string) => {
      const tokenIndex = roles.indexOf(token);
      const roleIndex = roles.indexOf(role);
      return roleIndex >= 0 && tokenIndex >= roleIndex;
    },
  };
}

// const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective(
//   'auth',
//   getUser,
// );

// let schema = makeExecutableSchema({
//   typeDefs: [
//     authDirectiveTypeDefs,
//     /* GraphQL */ `
//       type User @auth(requires: USER) {
//         name: String
//         banned: Boolean @auth(requires: ADMIN)
//         canPost: Boolean @auth(requires: REVIEWER)
//       }

//       type Query {
//         users: [User]
//       }
//     `,
//   ],
//   resolvers: {
//     Query: {
//       users: () => [
//         {
//           banned: true,
//           canPost: false,
//           name: 'Ben',
//         },
//       ],
//     },
//   },
// });
// export default schema = authDirectiveTransformer(schema);
