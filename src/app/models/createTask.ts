import { TaskPriority } from "./taskPriority";
import { TaskStatus } from "./taskStatus";

export interface CreateTask {
    title: string;
    description?: string;
    status: TaskStatus; 
    priority: TaskPriority;
    dueDate: string;
}