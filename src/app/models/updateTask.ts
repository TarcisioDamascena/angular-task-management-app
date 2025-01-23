import { TaskPriority } from "./taskPriority";
import { TaskStatus } from "./taskStatus";

export interface UpdateTask {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
}