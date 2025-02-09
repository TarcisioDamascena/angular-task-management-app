import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../services/task.service';
import { TaskEditModalComponent } from '../task-edit-modal/task-edit-modal.component';
import { Task } from '../../models/task';
import { TaskStatus } from '../../models/taskStatus';
import { TaskPriority } from '../../models/taskPriority';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, finalize } from 'rxjs';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CreateTask } from '../../models/createTask';
import { TaskFilters } from '../../models/TaskFilters';
import { TaskFilterComponent } from '../task-filter/task-filter.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  host: { 'id': 'task-list-component' },
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    TaskCardComponent,
    TaskFilterComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
  animations: [
    trigger('taskChanges', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class TaskListComponent {

  private originalTasksSubject = new BehaviorSubject<Task[]>([]);
  private currentFilters: TaskFilters = {
    search: '',
    status: [],
    priority: [],
    dueDateRange: { start: null, end: null },
    sortBy: 'dueDate',
    sortDirection: 'asc'
  };

  tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();
  displayedColumns: string[] = ['title', 'status', 'priority', 'actions'];
  isLoading: boolean = true;
  pendingOperations = new Set<number>();

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (tasks) => {
        this.originalTasksSubject.next(tasks);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Error loading tasks', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTask(taskId: number): void {
    this.pendingOperations.add(taskId);
    this.taskService.deleteTask(taskId).pipe(
      finalize(() => this.pendingOperations.delete(taskId))
    ).subscribe({
      next: () => {
        const currentOriginalTasks = this.originalTasksSubject.value;
        this.originalTasksSubject.next(currentOriginalTasks.filter(task => task.id !== taskId));
        this.applyFilters();
        this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
      }
    });
  }

  openTaskModal(task?: Task): void {
    const dialogRef = this.dialog.open(TaskEditModalComponent, {
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (task) {
        this.updateExistingTask(task, result);
      } else {
        this.createNewTask(result);
      }
    });
  }

  private updateExistingTask(task: Task, updatedData: Task): void {
    this.pendingOperations.add(task.id);
    this.taskService.updateTask(task.id, updatedData).pipe(
      finalize(() => this.pendingOperations.delete(task.id))
    ).subscribe({
      next: (updatedTask) => {
        const currentTasks = this.originalTasksSubject.value;
        const taskIndex = currentTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          const updatedTasks = [...currentTasks];
          updatedTasks[taskIndex] = updatedTask;
          this.originalTasksSubject.next(updatedTasks);
          this.applyFilters();
        }
        this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
      }
    });
  }

  private createNewTask(taskData: Task): void {
    const createTaskData: CreateTask = {
      title: taskData.title || '',
      description: taskData.description || 'you did not provide any description for this task!',
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      dueDate: taskData.dueDate || new Date().toISOString()
    };
    
    this.taskService.createTask(createTaskData).subscribe({
      next: (newTask) => {
        const currentTasks = this.originalTasksSubject.value;
        this.originalTasksSubject.next([...currentTasks, newTask]);
        this.applyFilters();
        this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.snackBar.open('Error creating task', 'Close', { duration: 3000 });
      }
    });
  }

  private filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
    return tasks.filter(task => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      if (filters.dueDateRange.start || filters.dueDateRange.end) {
        if (!task.dueDate) {
          return false;
        }

        const taskDate = new Date(task.dueDate);

        if (isNaN(taskDate.getTime())) {
          return false;
        }

        if (filters.dueDateRange.start && taskDate < filters.dueDateRange.start) {
          return false;
        }

        if (filters.dueDateRange.end) {
          const endDate = new Date(filters.dueDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (taskDate > endDate) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      const direction = filters.sortDirection === 'asc' ? 1 : -1;

      switch (filters.sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          const dateA = new Date(a.dueDate);
          const dateB = new Date(b.dueDate);

          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;

          return (dateA.getTime() - dateB.getTime()) * direction;
        case 'priority':
          return (this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority)) * direction;
        case 'status':
          return (this.getStatusWeight(a.status) - this.getStatusWeight(b.status)) * direction;
        case 'title':
          return a.title.localeCompare(b.title) * direction;
        default:
          return 0;
      }
    });
  }

  private getPriorityWeight(priority: TaskPriority): number {
    const weights = {
      [TaskPriority.URGENT]: 4,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1
    };
    return weights[priority] || 0;
  }

  private getStatusWeight(status: TaskStatus): number {
    const weights = {
      [TaskStatus.TODO]: 1,
      [TaskStatus.IN_PROGRESS]: 2,
      [TaskStatus.COMPLETED]: 3,
      [TaskStatus.CANCELLED]: 4
    };
    return weights[status] || 0;
  }

  onFiltersChanged(filters: TaskFilters): void {
    this.currentFilters = filters;
    this.applyFilters();
  }
  applyFilters(): void {
    const filteredTasks = this.filterTasks(this.originalTasksSubject.value, this.currentFilters);
    this.tasksSubject.next(filteredTasks);
  }

  toggleTaskCompletion(task: Task): void {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
    const updatedTask = { ...task, status: newStatus };

    this.pendingOperations.add(task.id);
    this.taskService.updateTask(task.id, updatedTask).pipe(
      finalize(() => this.pendingOperations.delete(task.id))
    ).subscribe({
      next: (result) => {
        const currentOriginalTasks = this.originalTasksSubject.value;
        const originalTaskIndex = currentOriginalTasks.findIndex(t => t.id === task.id);
        if (originalTaskIndex !== -1) {
          const updatedOriginalTasks = [...currentOriginalTasks];
          updatedOriginalTasks[originalTaskIndex] = result;
          this.originalTasksSubject.next(updatedOriginalTasks);
          this.applyFilters();
        }

        const message = newStatus === TaskStatus.COMPLETED ?
          'Task marked as completed' :
          'Task unmarked as completed';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.snackBar.open('Error updating task status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'urgent-priority';
      case TaskPriority.HIGH:
        return 'high-priority';
      case TaskPriority.MEDIUM:
        return 'medium-priority';
      case TaskPriority.LOW:
        return 'low-priority';
      default:
        return '';
    }
  }

  getFormattedStatus(status: TaskStatus): string {
    const statusMap = {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.COMPLETED]: 'Completed',
      [TaskStatus.CANCELLED]: 'Cancelled'
    };
    return statusMap[status] || '';
  }

  getFormattedPriority(priority: TaskPriority): string {
    const priorityMap = {
      [TaskPriority.HIGH]: 'High',
      [TaskPriority.MEDIUM]: 'Medium',
      [TaskPriority.LOW]: 'Low',
      [TaskPriority.URGENT]: 'Urgent'
    }
    return priorityMap[priority] || '';
  }

  private getEndOfDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  isDueSoon(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    const today = this.stripTime(new Date());
    const due = this.stripTime(new Date(dueDate));
    if (isNaN(due.getTime())) return false;

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  isOverdue(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    const now = new Date();
    const due = this.getEndOfDay(new Date(dueDate));
    if (isNaN(due.getTime())) return false;

    return now > due;
  }

  getDueDateStatus(dueDate: string | Date | undefined, status: TaskStatus): { icon: string; color: string; message: string } {
    if (status === TaskStatus.COMPLETED) {
      return {
        icon: 'check_circle',
        color: '#4CAF50',
        message: 'Task completed!'
      };
    }

    if (!dueDate) {
      return {
        icon: 'event',
        color: 'rgba(0, 0, 0, 0.7)',
        message: 'No due date set'
      };
    }

    if (this.isOverdue(dueDate)) {
      return {
        icon: 'error',
        color: '#E84A5F',
        message: 'Task is overdue!'
      };
    }
    if (this.isDueSoon(dueDate)) {
      return {
        icon: 'warning',
        color: '#FF9F1C',
        message: 'Due soon!'
      };
    }
    return {
      icon: 'event',
      color: 'rgba(0, 0, 0, 0.7)',
      message: ''
    };
  }

}
