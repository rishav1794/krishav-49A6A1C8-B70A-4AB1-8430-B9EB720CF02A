import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [DatabaseModule, AuthModule, TasksModule, AuditLogModule],
})
export class AppModule {}