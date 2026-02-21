import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  const authServiceMock = {
    getCurrentUser: jest.fn(() => ({
      id: 1,
      email: 'owner@acme.com',
      name: 'Alice Owner',
      role: 'owner',
      organizationId: 1,
    })),
    hasRole: jest.fn(() => true),
    logout: jest.fn(),
  };

  const taskServiceMock = {
    getTasks: jest.fn(() => of([])),
    createTask: jest.fn(() => of({})),
    updateTask: jest.fn(() => of({})),
    deleteTask: jest.fn(() => of({ message: 'ok' })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TaskService, useValue: taskServiceMock },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();
  });

  it('filters tasks by status and category', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    component.tasks = [
      {
        id: 1,
        title: 'A',
        status: 'todo',
        category: 'work',
        order: 0,
        organizationId: 1,
        createdById: 1,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'B',
        status: 'done',
        category: 'personal',
        order: 1,
        organizationId: 1,
        createdById: 1,
        createdAt: '2026-02-02T00:00:00.000Z',
        updatedAt: '2026-02-02T00:00:00.000Z',
      },
    ];

    component.filterStatus = 'todo';
    component.filterCategory = 'work';
    component.applyFilters();

    expect(component.filteredTasks).toHaveLength(1);
    expect(component.filteredTasks[0].id).toBe(1);
  });

  it('sorts tasks by title descending', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    component.tasks = [
      {
        id: 1,
        title: 'Alpha',
        status: 'todo',
        category: 'work',
        order: 1,
        organizationId: 1,
        createdById: 1,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Zulu',
        status: 'todo',
        category: 'work',
        order: 2,
        organizationId: 1,
        createdById: 1,
        createdAt: '2026-02-02T00:00:00.000Z',
        updatedAt: '2026-02-02T00:00:00.000Z',
      },
    ];

    component.sortBy = 'title';
    component.sortDirection = 'desc';
    component.applyFilters();

    expect(component.filteredTasks[0].title).toBe('Zulu');
    expect(component.filteredTasks[1].title).toBe('Alpha');
  });
});
