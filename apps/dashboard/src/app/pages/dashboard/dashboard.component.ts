import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentUser = this.authService.getCurrentUser();
  loading = false;
  showCreateModal = false;
  editingTask: Task | null = null;
  filterStatus = '';
  filterCategory = '';
  sortBy: 'order' | 'createdAt' | 'title' | 'status' | 'category' = 'order';
  sortDirection: 'asc' | 'desc' = 'asc';
  draggedTask: Task | null = null;
  actionError = '';

  statusDropZones: Array<{ label: string; value: Task['status']; classes: string }> = [
    { label: 'Todo', value: 'todo', classes: 'border-gray-300 bg-gray-50' },
    { label: 'In Progress', value: 'in_progress', classes: 'border-blue-300 bg-blue-50' },
    { label: 'Done', value: 'done', classes: 'border-green-300 bg-green-50' },
  ];

  newTask = {
    title: '',
    description: '',
    status: 'todo',
    category: 'work',
  };

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    const filtered = this.tasks.filter((task) => {
      const statusMatch = this.filterStatus
        ? task.status === this.filterStatus
        : true;
      const categoryMatch = this.filterCategory
        ? task.category === this.filterCategory
        : true;
      return statusMatch && categoryMatch;
    });

    this.filteredTasks = this.sortTasks(filtered);
  }

  private sortTasks(tasks: Task[]): Task[] {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    const sorted = [...tasks];

    sorted.sort((a, b) => {
      if (this.sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
      }

      if (this.sortBy === 'order') {
        return (a.order - b.order) * direction;
      }

      return String(a[this.sortBy]).localeCompare(String(b[this.sortBy])) * direction;
    });

    return sorted;
  }

  onSortChange() {
    this.applyFilters();
  }

  canEdit(): boolean {
    return this.authService.hasRole('owner', 'admin');
  }

  private isOwner(): boolean {
    return this.currentUser?.role === 'owner';
  }

  private isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canManageTask(task: Task): boolean {
    if (this.isOwner()) return true;
    if (this.isAdmin()) return task.createdById === this.currentUser?.id;
    return false;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const response = error as { error?: { message?: string } };
    return response?.error?.message ?? fallback;
  }

  clearActionError() {
    this.actionError = '';
  }

  createTask() {
    if (!this.newTask.title.trim()) return;
    this.clearActionError();
    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newTask = { title: '', description: '', status: 'todo', category: 'work' };
        this.loadTasks();
      },
      error: (error) => {
        this.actionError = this.getErrorMessage(error, 'Unable to create task.');
      },
    });
  }

  startEdit(task: Task) {
    this.clearActionError();
    if (!this.canManageTask(task)) {
      this.actionError = 'You can only edit tasks that you created.';
      return;
    }
    this.editingTask = { ...task };
  }

  saveEdit() {
    if (!this.editingTask) return;
    if (!this.canManageTask(this.editingTask)) {
      this.actionError = 'You can only edit tasks that you created.';
      this.editingTask = null;
      return;
    }
    this.clearActionError();
    const { title, description, status, category, assignedToId, order } = this.editingTask;
    this.taskService
      .updateTask(this.editingTask.id, {
        title,
        description,
        status,
        category,
        assignedToId,
        order,
      })
      .subscribe({
      next: () => {
        this.editingTask = null;
        this.loadTasks();
      },
      error: (error) => {
        this.actionError = this.getErrorMessage(error, 'Unable to update task.');
      },
    });
  }

  deleteTask(task: Task) {
    if (!this.canManageTask(task)) {
      this.actionError = 'You can only delete tasks that you created.';
      return;
    }
    if (!confirm('Delete this task?')) return;
    this.clearActionError();
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: (error) => {
        this.actionError = this.getErrorMessage(error, 'Unable to delete task.');
      },
    });
  }

  updateStatus(task: Task, status: Task['status']) {
    if (!this.canManageTask(task)) {
      this.actionError = 'You can only update status for tasks that you created.';
      return;
    }
    this.clearActionError();
    this.taskService.updateTask(task.id, { status }).subscribe({
      next: () => this.loadTasks(),
      error: (error) => {
        this.actionError = this.getErrorMessage(error, 'Unable to update task status.');
      },
    });
  }

  onDragStart(task: Task) {
    if (!this.canManageTask(task)) {
      this.actionError = 'You can only drag tasks that you created.';
      return;
    }
    this.clearActionError();
    this.draggedTask = task;
  }

  onDragEnd() {
    this.draggedTask = null;
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  dropOnStatus(status: Task['status']) {
    if (!this.draggedTask || this.draggedTask.status === status) {
      this.draggedTask = null;
      return;
    }

    this.updateStatus(this.draggedTask, status);
    this.draggedTask = null;
  }

  logout() {
    this.authService.logout();
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      work: 'bg-purple-100 text-purple-800',
      personal: 'bg-yellow-100 text-yellow-800',
      other: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }
}
