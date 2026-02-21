import { ForbiddenException } from '@nestjs/common';
import { Role } from '@krishav/data';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const createQueryBuilderMock = () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    return queryBuilder;
  };

  const taskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const auditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const organizationRepository = {
    find: jest.fn(),
  };

  let service: TasksService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(
      taskRepository as never,
      auditLogRepository as never,
      organizationRepository as never
    );
  });

  it('scopes owner visibility to own org and direct children', async () => {
    const queryBuilder = createQueryBuilderMock();
    taskRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    organizationRepository.find.mockResolvedValue([{ id: 2 }]);

    await service.findAll({
      id: 1,
      email: 'owner@acme.com',
      role: Role.OWNER,
      organizationId: 1,
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'task.organizationId IN (:...organizationIds)',
      { organizationIds: [1, 2] }
    );
  });

  it('scopes viewer visibility to own org only', async () => {
    const queryBuilder = createQueryBuilderMock();
    taskRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await service.findAll({
      id: 3,
      email: 'viewer@acme.com',
      role: Role.VIEWER,
      organizationId: 1,
    });

    expect(organizationRepository.find).not.toHaveBeenCalled();
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'task.organizationId IN (:...organizationIds)',
      { organizationIds: [1] }
    );
  });

  it('blocks viewer task edits', async () => {
    taskRepository.findOne.mockResolvedValue({
      id: 10,
      organizationId: 1,
      createdById: 1,
    });

    await expect(
      service.update(
        10,
        { title: 'updated' },
        {
          id: 3,
          email: 'viewer@acme.com',
          role: Role.VIEWER,
          organizationId: 1,
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('blocks admin from editing task created by another user', async () => {
    taskRepository.findOne.mockResolvedValue({
      id: 10,
      organizationId: 1,
      createdById: 99,
    });
    organizationRepository.find.mockResolvedValue([]);

    await expect(
      service.update(
        10,
        { title: 'updated' },
        {
          id: 2,
          email: 'admin@acme.com',
          role: Role.ADMIN,
          organizationId: 1,
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('blocks admin from deleting task created by another user', async () => {
    taskRepository.findOne.mockResolvedValue({
      id: 10,
      organizationId: 1,
      createdById: 99,
    });
    organizationRepository.find.mockResolvedValue([]);

    await expect(
      service.remove(10, {
        id: 2,
        email: 'admin@acme.com',
        role: Role.ADMIN,
        organizationId: 1,
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(taskRepository.delete).not.toHaveBeenCalled();
  });
});
