import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  category: 'work' | 'personal' | 'other';
  order: number;
  organizationId: number;
  createdById: number;
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  category?: string;
  assignedToId?: number;
  order?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  assignedToId?: number;
  order?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`, {
      headers: this.getHeaders(),
    });
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, payload, {
      headers: this.getHeaders(),
    });
  }

  updateTask(id: number, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/tasks/${id}`, {
      headers: this.getHeaders(),
    });
  }
}