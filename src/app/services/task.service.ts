import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Task } from '../models/task';
import { CreateTask } from '../models/createTask';
import { UpdateTask } from '../models/updateTask';
import { TaskStatus } from '../models/taskStatus';
import { TaskPriority } from '../models/taskPriority';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  private formatTaskData(task: CreateTask | UpdateTask): CreateTask | UpdateTask {
    return { ...task };
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  createTask(task: CreateTask): Observable<Task> {
    const formattedTask = this.formatTaskData(task);
    console.log('Sending create task request:', formattedTask);
    return this.http.post<Task>(this.API_URL, formattedTask).pipe(
      catchError(this.handleError)
    );
  }

  updateTask(taskId: number, task: UpdateTask): Observable<Task> {
    const formattedTask = this.formatTaskData(task);
    console.log('Sending update task request:', formattedTask);
    return this.http.put<Task>(`${this.API_URL}/${taskId}`, formattedTask).pipe(
      catchError(this.handleError)
    );
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${taskId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error (${error.status}): ${error.error?.message || error.message}`;
      console.error('Full server error response:', error.error);
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  filterTasks(status?: TaskStatus, priority?: TaskPriority, dueDateBefore?: Date): Observable<Task[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (priority) {
      params = params.set('priority', priority);
    }
    if (dueDateBefore) {
      params = params.set('dueDateBefore', dueDateBefore.toISOString());
    }
    return this.http.get<Task[]>(this.API_URL +'/filter', { params }).pipe(
      catchError(this.handleError)
    );
  }
}
