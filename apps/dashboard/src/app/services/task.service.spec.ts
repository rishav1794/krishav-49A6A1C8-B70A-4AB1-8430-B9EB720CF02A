import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const authServiceMock = {
    getToken: jest.fn(() => 'jwt-token'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches bearer token when fetching tasks', () => {
    service.getTasks().subscribe();

    const request = httpMock.expectOne('http://localhost:3000/tasks');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('sends update payload to API', () => {
    service.updateTask(10, { status: 'done' }).subscribe();

    const request = httpMock.expectOne('http://localhost:3000/tasks/10');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status: 'done' });
    request.flush({});
  });
});
