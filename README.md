# Task Management System (NX Monorepo)

Secure task management system with JWT authentication, RBAC, organization scoping, and audit logs.

## 1. Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm 9+

### Install dependencies
```bash
pnpm install
```

### Seed demo data
```bash
pnpm seed
```

### Run backend (NestJS API)
```bash
pnpm nx serve api
```
API runs on `http://localhost:3000`.

### Run frontend (Angular dashboard)
```bash
pnpm nx serve dashboard
```
Dashboard runs on `http://localhost:4200`.

### Test
```bash
pnpm nx test api
pnpm nx test dashboard
pnpm nx test auth
```

## 2. Environment Configuration

The app works without a `.env` file, but supports these variables:

- `PORT`  
  Backend port. Default: `3000`.
- `JWT_SECRET`  
  JWT signing secret. Default fallback in development: `super-secret-key`.

Current SQLite database file:
- `task-management.sqlite` (workspace root)

Example `.env`:
```bash
PORT=3000
JWT_SECRET=replace-with-strong-secret
```

## 3. Demo Accounts

After running `pnpm seed`:

- `owner@acme.com / password123`
- `admin@acme.com / password123`
- `viewer@acme.com / password123`

## 4. Architecture Overview

### NX layout
- `apps/api`: NestJS backend (auth, tasks, audit log, TypeORM entities)
- `apps/dashboard`: Angular frontend (login and task dashboard)
- `libs/data`: shared DTOs, enums, interfaces
- `libs/auth`: shared RBAC logic (role inheritance + permission helpers)

### Why shared libraries
- `libs/data` keeps request/response contracts and enums centralized for frontend/backend consistency.
- `libs/auth` centralizes RBAC behavior so access rules are reusable and testable.

## 5. Data Model Explanation

### Entities
- `Organization`
  - `id`, `name`, `parentOrganizationId`
  - self-relation supports 2-level hierarchy (parent -> child)
- `User`
  - `id`, `email`, `name`, `password`, `role`, `organizationId`
- `Task`
  - `id`, `title`, `description`, `status`, `category`, `order`
  - `organizationId`, `createdById`, `assignedToId`, timestamps
- `AuditLog`
  - `id`, `action`, `resource`, `resourceId`
  - `userId`, `userEmail`, `organizationId`, `details`, `createdAt`

### ERD-style diagram
```text
Organization (1) ----< User (many)
Organization (1) ----< Task (many)
Organization (1) ----< AuditLog (many)
User (1) ------------< Task.createdById (many)
User (0..1) ---------< Task.assignedToId (many)
User (1) ------------< AuditLog.userId (many)
Organization (parent) --< Organization (children)
```

## 6. Access Control Implementation

### Roles
- `owner`
- `admin`
- `viewer`

### Permissions
- `task:create`
- `task:read`
- `task:update`
- `task:delete`
- `audit_log:read`

### Role inheritance
- `owner` inherits `admin`, `viewer`
- `admin` inherits `viewer`
- `viewer` has only viewer-level access

### Organization hierarchy scoping
- viewers: own organization only
- admins/owners: own organization + direct child organizations
- ownership rule: admins can edit/delete only tasks they created; owners can manage all tasks in accessible organizations

### Enforcement points
- JWT guard validates bearer token.
- Roles guard checks inherited role access.
- Permissions guard checks permission access.
- Task service enforces org scoping and action-specific business rules.
- Audit log endpoint is restricted to owner/admin permission.

## 7. JWT Authentication + RBAC Flow

1. User logs in via `POST /auth/login`.
2. API validates credentials with bcrypt.
3. API returns JWT and user profile.
4. Frontend stores token and sends `Authorization: Bearer <token>` on task requests.
5. API JWT strategy decodes token and attaches user context.
6. Guards + service rules authorize/deny each action.

## 8. API Documentation

Base URL: `http://localhost:3000`

### `POST /auth/login`
- Request:
```json
{
  "email": "owner@acme.com",
  "password": "password123"
}
```
- Response:
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": 1,
    "email": "owner@acme.com",
    "name": "Alice Owner",
    "role": "owner",
    "organizationId": 1
  }
}
```

### `GET /tasks`
- Header: `Authorization: Bearer <token>`
- Response:
```json
[
  {
    "id": 1,
    "title": "Prepare report",
    "status": "todo",
    "category": "work",
    "order": 0,
    "organizationId": 1
  }
]
```

### `POST /tasks`
- Header: `Authorization: Bearer <token>`
- Request:
```json
{
  "title": "Create onboarding checklist",
  "description": "Draft tasks for new hires",
  "status": "todo",
  "category": "work"
}
```

### `PUT /tasks/:id`
- Header: `Authorization: Bearer <token>`
- Request:
```json
{
  "status": "in_progress"
}
```

### `DELETE /tasks/:id`
- Header: `Authorization: Bearer <token>`
- Response:
```json
{
  "message": "Task deleted successfully"
}
```

### `GET /audit-log`
- Header: `Authorization: Bearer <token>`
- Owner/Admin only.

## 9. Future Considerations

- Advanced role delegation and tenant-level policy management.
- JWT refresh-token flow and token rotation.
- CSRF protection strategy for cookie-based auth deployments.
- RBAC permission caching and invalidation.
- Deeper organization hierarchy with recursive traversal and optimized permission checks.
- More comprehensive API integration/e2e coverage around auth and access edge cases.
