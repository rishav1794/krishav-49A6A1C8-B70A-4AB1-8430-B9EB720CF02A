import { Permission, Role } from '@krishav/data';

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.OWNER]: [Role.ADMIN, Role.VIEWER],
  [Role.ADMIN]: [Role.VIEWER],
  [Role.VIEWER]: [],
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.AUDIT_LOG_READ,
  ],
  [Role.ADMIN]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.AUDIT_LOG_READ,
  ],
  [Role.VIEWER]: [Permission.TASK_READ],
};

export function getEffectiveRoles(role: Role): Role[] {
  const visited = new Set<Role>();
  const stack: Role[] = [role];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    stack.push(...ROLE_HIERARCHY[current]);
  }

  return [...visited];
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return getEffectiveRoles(userRole).includes(requiredRole);
}

export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some((requiredRole) => hasRole(userRole, requiredRole));
}

export function getEffectivePermissions(role: Role): Permission[] {
  const roles = getEffectiveRoles(role);
  const permissions = new Set<Permission>();

  for (const currentRole of roles) {
    for (const permission of ROLE_PERMISSIONS[currentRole] ?? []) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}

export function hasPermission(
  userRole: Role,
  requiredPermission: Permission
): boolean {
  return getEffectivePermissions(userRole).includes(requiredPermission);
}

export function hasAnyPermission(
  userRole: Role,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(userRole, permission)
  );
}
