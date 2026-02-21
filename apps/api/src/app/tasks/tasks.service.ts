import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Organization } from '../entities/organization.entity';
import { CreateTaskDto, UpdateTaskDto, Role, TaskStatus, TaskCategory } from '@krishav/data';

interface AuthUser {
  id: number;
  email: string;
  role: Role;
  organizationId: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>
  ) {}

  private async getAccessibleOrganizationIds(user: AuthUser): Promise<number[]> {
    const accessible = new Set<number>([user.organizationId]);

    if (user.role === Role.OWNER || user.role === Role.ADMIN) {
      const childOrganizations = await this.organizationRepository.find({
        where: { parentOrganizationId: user.organizationId },
        select: ['id'],
      });

      for (const org of childOrganizations) {
        accessible.add(org.id);
      }
    }

    return [...accessible];
  }

  private async assertOrganizationAccess(task: Task, user: AuthUser): Promise<void> {
    const accessibleOrganizationIds = await this.getAccessibleOrganizationIds(user);
    if (!accessibleOrganizationIds.includes(task.organizationId)) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async log(action: string, resourceId: number, user: AuthUser, details?: string) {
    const entry = this.auditLogRepository.create({
      action,
      resource: 'task',
      resourceId,
      userId: user.id,
      userEmail: user.email,
      organizationId: user.organizationId,
      details,
    });
    await this.auditLogRepository.save(entry);
    console.log(`[AUDIT] ${user.email} ${action} task ${resourceId}`);
  }

  async create(createTaskDto: CreateTaskDto, user: AuthUser) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      organizationId: user.organizationId,
      createdById: user.id,
      status: createTaskDto.status || TaskStatus.TODO,
      category: createTaskDto.category || TaskCategory.WORK,
    });
    const saved = await this.taskRepository.save(task);
    await this.log('CREATE', saved.id, user);
    return saved;
  }

  async findAll(user: AuthUser) {
    const organizationIds = await this.getAccessibleOrganizationIds(user);
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.organizationId IN (:...organizationIds)', { organizationIds })
      .orderBy('task."order"', 'ASC')
      .addOrderBy('task.createdAt', 'DESC')
      .getMany();
  }


  async update(id: number, updateTaskDto: UpdateTaskDto, user: AuthUser) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    await this.assertOrganizationAccess(task, user);

    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot edit tasks');
    }

    if (user.role === Role.ADMIN && task.createdById !== user.id) {
      throw new ForbiddenException('Admins can only edit their own tasks');
    }

    await this.taskRepository.update(id, updateTaskDto);
    await this.log('UPDATE', id, user);
    return this.taskRepository.findOne({ where: { id } });
  }

  async remove(id: number, user: AuthUser) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    await this.assertOrganizationAccess(task, user);

    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    if (user.role === Role.ADMIN && task.createdById !== user.id) {
      throw new ForbiddenException('Admins can only delete their own tasks');
    }

    await this.taskRepository.delete(id);
    await this.log('DELETE', id, user);
    return { message: 'Task deleted successfully' };
  }
}
