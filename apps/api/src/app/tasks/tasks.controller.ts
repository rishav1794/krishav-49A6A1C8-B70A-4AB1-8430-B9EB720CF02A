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
import { CreateTaskDto, UpdateTaskDto, Role } from '@krishav/data';

interface AuthRequest {
  user: {
    id: number;
    email: string;
    role: Role;
    organizationId: number;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: AuthRequest) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.tasksService.findAll(req.user);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthRequest
  ) {
    return this.tasksService.update(+id, updateTaskDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.tasksService.remove(+id, req.user);
  }
}