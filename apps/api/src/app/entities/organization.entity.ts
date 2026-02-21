import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    parentOrganizationId?: number;

    @ManyToOne (() => Organization, (org) => org.children, {nullable: true})
    @JoinColumn({ name: 'parentOrganizationId' })
    parent?: Organization;

    @OneToMany(() => Organization, (org) => org.parent)
    children!: Organization[];

    @CreateDateColumn()
    createdAt!: Date;
}