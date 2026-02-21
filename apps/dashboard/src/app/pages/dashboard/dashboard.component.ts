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
    this.filteredTasks = this.tasks.filter((task) => {
      const statusMatch = this.filterStatus
        ? task.status === this.filterStatus
        : true;
      const categoryMatch = this.filterCategory
        ? task.category === this.filterCategory
        : true;
      return statusMatch && categoryMatch;
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole('owner', 'admin');
  }

  createTask() {
    if (!this.newTask.title.trim()) return;
    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newTask = { title: '', description: '', status: 'todo', category: 'work' };
        this.loadTasks();
      },
    });
  }

  startEdit(task: Task) {
    this.editingTask = { ...task };
  }

  saveEdit() {
    if (!this.editingTask) return;
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
    });
  }

  deleteTask(id: number) {
    if (!confirm('Delete this task?')) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
    });
  }

  updateStatus(task: Task, status: string) {
    this.taskService.updateTask(task.id, { status }).subscribe({
      next: () => this.loadTasks(),
    });
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
