import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { CreateTaskDto, UpdateTaskDto, Permission, Role } from '@krishav/data';

interface AuthRequest {
  user: {
    id: number;
    email: string;
    role: Role;
    organizationId: number;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Permissions(Permission.TASK_CREATE)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: AuthRequest) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @Permissions(Permission.TASK_READ)
  findAll(@Request() req: AuthRequest) {
    return this.tasksService.findAll(req.user);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.TASK_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthRequest
  ) {
    return this.tasksService.update(+id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.TASK_DELETE)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.remove(+id, req.user);
  }
}
