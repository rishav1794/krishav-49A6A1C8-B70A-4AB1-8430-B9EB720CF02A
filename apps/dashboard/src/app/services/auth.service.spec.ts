import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores token and user after successful login', () => {
    service.login('owner@acme.com', 'password123').subscribe();

    const request = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({
      access_token: 'jwt-token',
      user: {
        id: 1,
        email: 'owner@acme.com',
        name: 'Alice Owner',
        role: 'owner',
        organizationId: 1,
      },
    });

    expect(service.getToken()).toBe('jwt-token');
    expect(service.hasRole('owner')).toBe(true);
  });

  it('returns false for hasRole when user is not logged in', () => {
    expect(service.hasRole('admin')).toBe(false);
  });
});
