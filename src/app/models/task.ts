import { TaskPriority } from "./taskPriority";
import { TaskStatus } from "./taskStatus";

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}
