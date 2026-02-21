import { Permission, Role } from '@krishav/data';
import {
  getEffectiveRoles,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from './auth';

describe('auth RBAC helpers', () => {
  it('should apply role inheritance', () => {
    expect(getEffectiveRoles(Role.OWNER)).toEqual(
      expect.arrayContaining([Role.OWNER, Role.ADMIN, Role.VIEWER])
    );
    expect(getEffectiveRoles(Role.ADMIN)).toEqual(
      expect.arrayContaining([Role.ADMIN, Role.VIEWER])
    );
    expect(getEffectiveRoles(Role.VIEWER)).toEqual([Role.VIEWER]);
  });

  it('should resolve role checks using inheritance', () => {
    expect(hasRole(Role.OWNER, Role.ADMIN)).toBe(true);
    expect(hasRole(Role.ADMIN, Role.VIEWER)).toBe(true);
    expect(hasRole(Role.VIEWER, Role.ADMIN)).toBe(false);
    expect(hasAnyRole(Role.OWNER, [Role.VIEWER])).toBe(true);
  });

  it('should resolve permission checks by role', () => {
    expect(hasPermission(Role.OWNER, Permission.AUDIT_LOG_READ)).toBe(true);
    expect(hasPermission(Role.ADMIN, Permission.TASK_DELETE)).toBe(true);
    expect(hasPermission(Role.VIEWER, Permission.TASK_READ)).toBe(true);
    expect(hasPermission(Role.VIEWER, Permission.TASK_UPDATE)).toBe(false);
    expect(
      hasAnyPermission(Role.ADMIN, [
        Permission.TASK_UPDATE,
        Permission.AUDIT_LOG_READ,
      ])
    ).toBe(true);
  });
});
