import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './users-role';
import { GqlExecutionContext } from '@nestjs/graphql';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const ctx = GqlExecutionContext.create(context);

    const roles = ctx.getContext()?.headers?.roles ?? [Role.ADMIN];

    if (!requireRoles) {
      return true;
    }
    //const {user}=context.switchToHttp().getRequest();

    return requireRoles.some((role) => roles.includes(role));
  }
}
