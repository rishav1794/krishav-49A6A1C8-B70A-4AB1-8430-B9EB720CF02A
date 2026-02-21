import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Role } from '@krishav/data';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'task-management.sqlite',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Organization]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const orgRepo = app.get<Repository<Organization>>(
    getRepositoryToken(Organization)
  );
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const parentOrg = orgRepo.create({ name: 'Acme Corp' });
  await orgRepo.save(parentOrg);

  const childOrg = orgRepo.create({
    name: 'Acme Engineering',
    parentOrganizationId: parentOrg.id,
  });
  await orgRepo.save(childOrg);

  const hashedPassword = await bcrypt.hash('password123', 10);

  await userRepo.save([
    userRepo.create({
      email: 'owner@acme.com',
      name: 'Alice Owner',
      password: hashedPassword,
      role: Role.OWNER,
      organizationId: parentOrg.id,
    }),
    userRepo.create({
      email: 'admin@acme.com',
      name: 'Bob Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      organizationId: parentOrg.id,
    }),
    userRepo.create({
      email: 'viewer@acme.com',
      name: 'Carol Viewer',
      password: hashedPassword,
      role: Role.VIEWER,
      organizationId: parentOrg.id,
    }),
  ]);

  console.log('✅ Seed complete!');
  console.log('  owner@acme.com / password123 (Owner)');
  console.log('  admin@acme.com / password123 (Admin)');
  console.log('  viewer@acme.com / password123 (Viewer)');

  await app.close();
}

seed();