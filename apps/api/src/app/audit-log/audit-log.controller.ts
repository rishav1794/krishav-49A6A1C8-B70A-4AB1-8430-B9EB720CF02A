import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@krishav/data';

interface AuthRequest {
  user: {
    id: number;
    email: string;
    role: Role;
    organizationId: number;
  };
}

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll(@Request() req: AuthRequest) {
    return this.auditLogRepository.find({
      where: { organizationId: req.user.organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}