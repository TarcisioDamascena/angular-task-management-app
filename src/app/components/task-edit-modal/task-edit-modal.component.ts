import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { TaskStatus } from '../../models/taskStatus';
import { TaskPriority } from '../../models/taskPriority';
import { Task } from '../../models/task';
import { CustomDateAdapter } from '../../services/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../services/custom-date-format';

@Component({
  selector: 'app-task-edit-modal',
  standalone: true,
  host: { 'id': 'task-edit-modal-component' },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-edit-modal.component.html',
  styleUrl: './task-edit-modal.component.css',
  providers: [
    {provide: DateAdapter, useClass: CustomDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS}
  ]
})
export class TaskEditModalComponent {

  taskForm: FormGroup;
  statusOptions = Object.values(TaskStatus);
  priorityOptions = Object.values(TaskPriority);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null,
  ) {
    this.taskForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      description: [data?.description || ''],
      status: [data?.status || TaskStatus.TODO, Validators.required],
      priority: [data?.priority || TaskPriority.MEDIUM, Validators.required],
      dueDate: [data?.dueDate ? new Date(data.dueDate) : null]
    })
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

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = { ...this.taskForm.value };

      if (formValue.dueDate) {
        formValue.dueDate = (formValue.dueDate as Date).toISOString();
      }

      const cleanData = {
        title: formValue.title?.trim(),
        description: formValue.description?.trim(),
        status: formValue.status,
        priority: formValue.priority,
        dueDate: formValue.dueDate
      };

      console.log('Clean form data being sent:', cleanData);
      this.dialogRef.close(cleanData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
