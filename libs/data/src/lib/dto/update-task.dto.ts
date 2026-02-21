import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskCategory } from '../enums/task-category.enum';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskCategory)
    category?: TaskCategory;

    @IsOptional()
    @IsNumber()
    assignedToId?: number;

    @IsOptional()
    @IsNumber()
    order?: number;
}