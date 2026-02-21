import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
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
    private auditLogRepository: Repository<AuditLog>
  ) {}

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
  return this.taskRepository
    .createQueryBuilder('task')
    .where('task.organizationId = :organizationId', {
      organizationId: user.organizationId,
    })
    .orderBy('task."order"', 'ASC')
    .addOrderBy('task.createdAt', 'DESC')
    .getMany();
}


  async update(id: number, updateTaskDto: UpdateTaskDto, user: AuthUser) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot edit tasks');
    }

    await this.taskRepository.update(id, updateTaskDto);
    await this.log('UPDATE', id, user);
    return this.taskRepository.findOne({ where: { id } });
  }

  async remove(id: number, user: AuthUser) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) throw new NotFoundException('Task not found');

    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

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