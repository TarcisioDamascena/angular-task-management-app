import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../../models/task';
import { TaskFilters } from '../../models/TaskFilters';
import { TaskStatus } from '../../models/taskStatus';
import { TaskPriority } from '../../models/taskPriority';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './task-filter.component.html',
  styleUrl: './task-filter.component.css'
})
export class TaskFilterComponent {

  @Input() tasks: Task[] = [];
  @Output() filtersChanged = new EventEmitter<TaskFilters>();

  filters: TaskFilters = {
    search: '',
    status: [],
    priority: [],
    dueDateRange: {
      start: null,
      end: null
    },
    sortBy: 'dueDate',
    sortDirection: 'desc'
  };

  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;

  statusOptions = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.COMPLETED, label: 'Completed' },
    { value: TaskStatus.CANCELLED, label: 'Cancelled' }
  ];

  priorityOptions = [
    { value: TaskPriority.URGENT, label: 'Urgent' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.LOW, label: 'Low' }
  ];

  sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Title' }
  ];

  clearFilters(): void {
    this.filters = {
      search: '',
      status: [],
      priority: [],
      dueDateRange: {
        start: null,
        end: null
      },
      sortBy: 'dueDate',
      sortDirection: 'desc'
    };
    this.applyFilters();
  }

  applyFilters(): void {
    this.filtersChanged.emit(this.filters);
  }
}
