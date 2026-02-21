import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'task-management.sqlite',
            entities: [User, Organization, Task, AuditLog],
            synchronize: true,
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}