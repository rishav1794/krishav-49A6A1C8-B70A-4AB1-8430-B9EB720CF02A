import { Role } from '../enums/role.enum';

export interface IUser {
    id: number;
    emial: string;
    name: string;
    role: Role;
    organizationId: number;
    createdAt: Date;
}