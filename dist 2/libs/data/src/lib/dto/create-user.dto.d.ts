import { Role } from '../enums/role.enum';
export declare class CreateUserDto {
    email: string;
    name: string;
    password: string;
    role: Role;
    organizationId: number;
}
