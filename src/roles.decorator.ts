import { SetMetadata } from '@nestjs/common';
import { Role } from './users-role';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
