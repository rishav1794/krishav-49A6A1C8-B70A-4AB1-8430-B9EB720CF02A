import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role } from '@krishav/data';
import { hasAnyPermission } from '@krishav/auth';
import { PERMISSIONS_KEY } from './permissions.decorator';

interface AuthRequestUser {
  role: Role;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: AuthRequestUser }>();
    return hasAnyPermission(user.role, requiredPermissions);
  }
}
