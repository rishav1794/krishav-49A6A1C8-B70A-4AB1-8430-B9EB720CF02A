import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Role } from '@krishav/data';
import { Organization } from './organization.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    name!: string;

    @Column()
    password!: string;

    @Column({ type: 'text', default: Role.VIEWER })
    role!: string;

    @Column()
    organizationId!: number;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization!: Organization;
    
    @CreateDateColumn()
    createdAt!: Date;
}