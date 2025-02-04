import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../models/task';
import { TaskPriority } from '../../models/taskPriority';
import { TaskStatus } from '../../models/taskStatus';

@Component({
  selector: 'app-task-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {

  @Input() task!: Task;
  @Input() isPending: boolean = false;

  @Output() onToggleCompletion = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<Task>();

  getStatusColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.URGENT: return 'urgent-priority';
      case TaskPriority.HIGH: return 'high-priority';
      case TaskPriority.MEDIUM: return 'medium-priority';
      case TaskPriority.LOW: return 'low-priority';
      default: return '';
    }
  }

  getFormattedStatus(status: TaskStatus): string {

    const statusMap: Record<TaskStatus, string> = {
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

  private getEndOfTheDay(date: Date): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isDueSoon(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    const today = this.stripTime(new Date());
    const due = this.stripTime(new Date(dueDate));
    if (isNaN(due.getTime())) return false;

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  private isOverdue(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    const now = new Date();
    const due = this.getEndOfTheDay(new Date(dueDate));
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
