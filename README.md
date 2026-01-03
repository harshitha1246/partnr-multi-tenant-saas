
# Partnr Multi-Tenant SaaS Platform

## Project Description
A multi-tenant SaaS platform with Project & Task Management.  
Designed for organizations to manage multiple tenants, users, projects, and tasks with role-based access control.  

**Target Audience:**  
Small to medium-sized businesses looking for a multi-tenant project management solution.

---

## Features
- Multi-tenant architecture with isolated tenant data
- Role-based access control (Super Admin, Tenant Admin, User)
- Tenant registration with automatic subdomain creation
- User management per tenant
- Project management (create, update, delete)
- Task management (assign, update, status tracking)
- JWT-based authentication
- Password hashing using bcrypt
- Audit logging for key actions
- Dockerized backend, frontend, and database
- Automated database migrations
- Seed data for testing
- Health check endpoint
- API documentation (Markdown/Swagger/Postman)
- Responsive frontend dashboard
- Project statistics and graphs
- Easy setup with Docker Compose

---

## Technology Stack

**Frontend:** React 18, Vite, JavaScript, CSS  
**Backend:** Node.js 20, Express.js  
**Database:** PostgreSQL 15  
**Authentication:** JWT, bcrypt  
**Containerization:** Docker, Docker Compose  

---

## Architecture Overview

This system implements multi-tenancy where each tenant has **isolated data**.  
The backend exposes REST APIs consumed by the frontend.  
Docker ensures reproducible environments and easy deployment.

**Architecture Diagram:**  
`docs/images/system-architecture.png`

---

## Installation & Setup

### Prerequisites
- Docker & Docker Compose installed
- Git installed

### Steps
1. Clone the repository:
```bash
git clone https://github.com/harshitha1246/partnr-multi-tenant-saas.git
cd partnr-multi-tenant-saas
````

2. Build and start services:

```bash
docker compose up -d --build
```

3. Verify running containers:

```bash
docker ps
```

4. Check backend health:

```bash
curl http://localhost:5000/api/health
```

5. Frontend accessible at:

```
http://localhost:3000
```

---

## Environment Variables

**Backend (`backend/.env`):**

```
PORT=5000
DB_HOST=database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=partnr
JWT_SECRET=your_jwt_secret
```

**Frontend (`frontend/.env`):**

```
VITE_API_URL=http://localhost:5000/api
```

---

## API Documentation

* All 19 endpoints documented in `docs/API.md`
* Swagger available at `/api/docs` (if implemented)
* Example endpoints:

  * `POST /api/auth/register-tenant`
  * `POST /api/auth/login`
  * `GET /api/projects`
  * `POST /api/tasks`
* Authentication required for protected endpoints
* Request/Response examples included in documentation

---


## License

MIT



✅ After creating this file:  

```bash
git add README.md
git commit -m "Add complete project README with setup, features, and API overview"
git push origin master
````

---