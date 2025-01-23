import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../services/task.service';
import { TaskEditModalComponent } from '../task-edit-modal/task-edit-modal.component';
import { Task } from '../../models/task';
import { TaskStatus } from '../../models/taskStatus';
import { TaskPriority } from '../../models/taskPriority';

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
    MatProgressSpinnerModule
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

}
