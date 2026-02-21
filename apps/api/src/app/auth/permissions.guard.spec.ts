import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role } from '@krishav/data';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new PermissionsGuard(reflector);

  const mockContext = (role: Role): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows when no permissions are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    const result = guard.canActivate(mockContext(Role.VIEWER));

    expect(result).toBe(true);
  });

  it('allows admin for task update permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      Permission.TASK_UPDATE,
    ]);

    const result = guard.canActivate(mockContext(Role.ADMIN));

    expect(result).toBe(true);
  });

  it('denies viewer for task update permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      Permission.TASK_UPDATE,
    ]);

    const result = guard.canActivate(mockContext(Role.VIEWER));

    expect(result).toBe(false);
  });
});
