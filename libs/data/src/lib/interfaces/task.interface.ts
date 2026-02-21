import { TaskStatus } from "../enums/task-status.enum";
import { TaskCategory } from "../enums/task-category.enum";

export interface ITask {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    category: TaskCategory;
    order: number;
    organizationId: number;
    createdById: number;
    assignedToId?: number;
    createdAt: Date;
    updatedAt: Date;
}