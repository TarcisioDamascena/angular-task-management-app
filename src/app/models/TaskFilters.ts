import { TaskPriority } from "./taskPriority";
import { TaskStatus } from "./taskStatus";

export interface TaskFilters {
    search: string;
    status: TaskStatus[];
    priority: TaskPriority[];
    dueDateRange: {
        start: Date | null;
        end: Date | null;
    };
    sortBy: 'dueDate' | 'priority' | 'status' | 'title';
    sortDirection: 'asc' | 'desc';
}