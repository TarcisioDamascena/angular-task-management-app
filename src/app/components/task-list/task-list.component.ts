import { Component, OnInit } from '@angular/core';
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
    MatTooltipModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {

  tasks: Task[] = [];
  displayedColumns: string[] = ['title', 'status', 'priority', 'actions'];
  isLoading: boolean = true;

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
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error)
        this.isLoading = false;
      }
    });
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe({
      next: () => this.loadTasks(),
      error: (error) => console.error('Error deleting task:', error)
    });
  }

  openTaskModal(task?: Task): void {
    const dialogRef = this.dialog.open(TaskEditModalComponent, {
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (task) {
          this.taskService.updateTask(task.id, result).subscribe({
            next: () => {
              this.loadTasks();
              this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
            },
            error: (error) => {
              this.snackBar.open('Error updating task', 'Close', { duration: 3000 });
            }
          });
        } else {
          this.taskService.createTask(result).subscribe({
            next: () => {
              this.loadTasks();
              this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
            },
            error: (error) => {
              this.snackBar.open('Error creating task', 'Close', { duration: 3000 });
            }
          });
        }
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

  getDueDateStatus(dueDate: string | Date | undefined): { icon: string; color: string; message: string } {
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
