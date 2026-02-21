import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Permission, Role } from '@krishav/data';

interface AuthRequest {
  user: {
    id: number;
    email: string;
    role: Role;
    organizationId: number;
  };
}

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @Permissions(Permission.AUDIT_LOG_READ)
  findAll(@Request() req: AuthRequest) {
    return this.auditLogRepository.find({
      where: { organizationId: req.user.organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
