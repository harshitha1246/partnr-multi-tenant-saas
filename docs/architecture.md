# Step 1.2.1: System Architecture Design

## 1. High-Level System Architecture

### Overview

The system follows a standard **three-tier SaaS architecture** designed to support multi-tenancy, scalability, and security. All tenants share the same application and database while maintaining strict data isolation using a tenant identifier.

### Components

1. **Client (Browser)**

   * Web browser used by Super Admins, Tenant Admins, and End Users
   * Communicates with frontend via HTTPS

2. **Frontend Application (React.js)**

   * Handles user interface and user experience
   * Manages routing, authentication state, and API calls
   * Sends JWT token with every protected request

3. **Backend API Server (Node.js + Express)**

   * Exposes REST APIs
   * Handles authentication, authorization, and business logic
   * Resolves tenant context from JWT or subdomain

4. **Authentication Flow**

   * User logs in with credentials
   * Backend validates credentials
   * JWT token issued containing user_id, tenant_id, and role
   * Token used for subsequent API requests

5. **Database (PostgreSQL)**

   * Shared database with shared schema
   * All tenant-specific tables contain tenant_id
   * Indexed tenant_id columns for performance

### Architecture Diagram

**Diagram File:** `docs/images/system-architecture.png`

**Diagram should show:**

* Browser → Frontend (HTTPS)
* Frontend → Backend API (JWT)
* Backend → Database
* Authentication flow using JWT

---

## 2. Database Schema Design (ERD)

### Overview

The database uses a **shared schema multi-tenant design**. Each tenant’s data is isolated using a `tenant_id` foreign key in all relevant tables.

### Core Tables

1. **tenants**

   * id (PK)
   * name
   * status
   * created_at

2. **users**

   * id (PK)
   * tenant_id (FK → tenants.id)
   * email
   * password_hash
   * role
   * created_at

3. **projects**

   * id (PK)
   * tenant_id (FK → tenants.id)
   * name
   * description
   * created_at

4. **tasks**

   * id (PK)
   * project_id (FK → projects.id)
   * tenant_id (FK → tenants.id)
   * assigned_to (FK → users.id)
   * status
   * created_at

### Indexes

* Index on tenant_id in users, projects, and tasks tables
* Composite index on (tenant_id, project_id)

### ERD Diagram

**Diagram File:** `docs/images/database-erd.png`

**Diagram should show:**

* Relationships between tenants, users, projects, and tasks
* Primary keys and foreign keys
* tenant_id clearly marked

---

## 3. API Architecture

### Authentication APIs

| Endpoint           | Method | Auth Required | Role   |
| ------------------ | ------ | ------------- | ------ |
| /api/auth/register | POST   | No            | Public |
| /api/auth/login    | POST   | No            | Public |
| /api/auth/logout   | POST   | Yes           | All    |

### Tenant APIs

| Endpoint                 | Method | Auth Required | Role        |
| ------------------------ | ------ | ------------- | ----------- |
| /api/tenants             | POST   | Yes           | Super Admin |
| /api/tenants             | GET    | Yes           | Super Admin |
| /api/tenants/{id}        | PUT    | Yes           | Super Admin |
| /api/tenants/{id}/status | PATCH  | Yes           | Super Admin |

### User APIs

| Endpoint        | Method | Auth Required | Role         |
| --------------- | ------ | ------------- | ------------ |
| /api/users      | POST   | Yes           | Tenant Admin |
| /api/users      | GET    | Yes           | Tenant Admin |
| /api/users/{id} | PUT    | Yes           | Tenant Admin |
| /api/users/{id} | DELETE | Yes           | Tenant Admin |

### Project APIs

| Endpoint           | Method | Auth Required | Role         |
| ------------------ | ------ | ------------- | ------------ |
| /api/projects      | POST   | Yes           | Tenant Admin |
| /api/projects      | GET    | Yes           | Tenant User  |
| /api/projects/{id} | PUT    | Yes           | Tenant Admin |
| /api/projects/{id} | DELETE | Yes           | Tenant Admin |

### Task APIs

| Endpoint        | Method | Auth Required | Role         |
| --------------- | ------ | ------------- | ------------ |
| /api/tasks      | POST   | Yes           | Tenant User  |
| /api/tasks      | GET    | Yes           | Tenant User  |
| /api/tasks/{id} | PUT    | Yes           | Tenant User  |
| /api/tasks/{id} | DELETE | Yes           | Tenant Admin |

---

**Status:** Completed
