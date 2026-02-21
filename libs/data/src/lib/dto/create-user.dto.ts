import { IsEmail, IsString, IsEnum, IsNumber } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    name!: string;

    @IsString()
    password!: string;

    @IsEnum(Role)
    role!: Role;

    @IsNumber()
    organizationId!: number;
}