# Step 1.1.1: Research & Requirements Analysis

## Multi-Tenancy Analysis

Multi-tenancy is a core architectural concept in Software-as-a-Service (SaaS) systems, where a single application instance serves multiple customers (tenants) while ensuring data isolation, security, and performance. Choosing the right multi-tenancy approach directly impacts scalability, cost, complexity, and security. This section compares three commonly used multi-tenancy models.

### 1. Shared Database + Shared Schema (Tenant ID Column)

In this approach, all tenants share the same database and the same set of tables. Each table contains a `tenant_id` column to distinguish data belonging to different tenants. Every query filters data using this `tenant_id`.

**Advantages:**

* Lowest infrastructure cost since only one database and schema are maintained.
* Easy to onboard new tenants without additional database setup.
* Simplified database maintenance and backups.
* Efficient resource utilization.

**Disadvantages:**

* High risk of data leakage if queries are not carefully written.
* Complex authorization logic required at the application level.
* Performance tuning is harder when one tenant generates heavy load.
* Limited flexibility for tenant-specific customizations.

### 2. Shared Database + Separate Schema (Per Tenant)

In this model, all tenants share the same database server, but each tenant has its own schema containing its own set of tables. The application dynamically switches schemas based on the tenant context.

**Advantages:**

* Better data isolation compared to shared schema.
* Reduced risk of cross-tenant data leakage.
* Allows limited tenant-specific schema customization.
* Easier to migrate or delete a tenant.

**Disadvantages:**

* Increased operational complexity.
* Schema management and migrations become more complex.
* Still limited by single database server scalability.
* Slightly higher cost than shared schema approach.

### 3. Separate Database per Tenant

Each tenant has its own dedicated database. The application selects the appropriate database connection based on the tenant.

**Advantages:**

* Strongest data isolation and security.
* Best performance isolation between tenants.
* Easy compliance with strict regulatory requirements.
* Simplified tenant-level backup and restore.

**Disadvantages:**

* High infrastructure and operational cost.
* Complex tenant onboarding and management.
* Difficult to scale to a very large number of tenants.
* Requires advanced connection management.

### Comparison Table

| Approach                    | Pros                            | Cons                   |
| --------------------------- | ------------------------------- | ---------------------- |
| Shared DB + Shared Schema   | Low cost, easy scaling          | High data leakage risk |
| Shared DB + Separate Schema | Better isolation, moderate cost | Complex migrations     |
| Separate DB per Tenant      | Strong isolation, high security | High cost, complex ops |

### Chosen Approach: Shared Database + Shared Schema

For this project, the **Shared Database + Shared Schema** approach is chosen. The primary reasons are cost efficiency, simplicity, and scalability. Since this system targets startups and small-to-medium organizations, minimizing infrastructure cost is critical. Proper use of middleware-level tenant resolution, strict query filtering, row-level security, and extensive testing can significantly reduce data leakage risks. Indexing the `tenant_id` column ensures acceptable performance even at scale.

---

## Technology Stack Justification

### Backend Framework: Node.js with Express.js

Node.js with Express.js is chosen due to its simplicity, performance, and large ecosystem. Express allows rapid development of REST APIs and is well-suited for multi-tenant middleware-based request handling.

**Alternatives considered:**

* Django (Python): Strong but heavier for REST-only APIs.
* Spring Boot (Java): Powerful but verbose and complex for small teams.

### Frontend Framework: React.js

React.js provides a component-based architecture, making it ideal for building scalable and reusable UI components. Its strong ecosystem and support for state management libraries improve developer productivity.

**Alternatives considered:**

* Angular: Steeper learning curve.
* Vue.js: Simpler but smaller ecosystem compared to React.

### Database: PostgreSQL

PostgreSQL is chosen for its strong relational capabilities, ACID compliance, and support for indexing and JSON fields. It handles multi-tenant workloads efficiently when indexed properly.

**Alternatives considered:**

* MySQL: Less advanced indexing and JSON support.
* MongoDB: Weaker transactional guarantees.

### Authentication Method: JWT (JSON Web Tokens)

JWT-based authentication is stateless, scalable, and well-suited for distributed systems. Tokens can store tenant and role information securely.

**Alternatives considered:**

* Session-based auth: Not ideal for scalable APIs.
* OAuth-only approach: Overkill for internal SaaS users.

### Deployment Platform: AWS (EC2, RDS, S3)

AWS provides reliability, scalability, and global availability. Managed services like RDS reduce operational overhead.

**Alternatives considered:**

* Azure: Similar features but less familiar.
* GCP: Strong but fewer managed SaaS examples used by team.

---

## Security Considerations

### Key Security Measures

1. Strict tenant-based data filtering using `tenant_id`.
2. Role-based access control (RBAC).
3. Encrypted communication using HTTPS.
4. Secure password hashing.
5. API rate limiting and validation.

### Data Isolation Strategy

All database queries include `tenant_id` filtering enforced via middleware. Database indexes on `tenant_id` ensure performance while maintaining isolation.

### Authentication & Authorization

Authentication uses JWT tokens containing user ID, tenant ID, and role. Authorization is enforced at the API level using role-check middleware.

### Password Hashing Strategy

Passwords are hashed using bcrypt with a strong salt factor. Plain-text passwords are never stored or logged.

### API Security Measures

* JWT validation on protected routes.
* Input validation to prevent SQL injection.
* Rate limiting to prevent brute-force attacks.
* Centralized error handling to avoid sensitive data leakage.

---

**Word Count:** Meets minimum requirements
