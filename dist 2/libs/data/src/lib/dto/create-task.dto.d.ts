import { TaskStatus } from '../enums/task-status.enum';
import { TaskCategory } from '../enums/task-category.enum';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    category?: TaskCategory;
    assignedToId?: number;
    order?: number;
}
