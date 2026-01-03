-- Super Admin (no tenant)
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role
) VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$Q7Yy8WcYxVZpTQbD5tJv7u4Q1w0u3VJ2nFq0O3vF9R7R5Z6K6Yk8O',
    'System Super Admin',
    'super_admin'
);

-- Demo Tenant
INSERT INTO tenants (
    id,
    name,
    subdomain,
    status,
    subscription_plan,
    max_users,
    max_projects
) VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    20,
    50
);

-- Tenant Admin for Demo Company
INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role
)
SELECT
    gen_random_uuid(),
    t.id,
    'admin@demo.com',
    '$2b$10$Q7Yy8WcYxVZpTQbD5tJv7u4Q1w0u3VJ2nFq0O3vF9R7R5Z6K6Yk8O',
    'Demo Tenant Admin',
    'tenant_admin'
FROM tenants t
WHERE t.subdomain = 'demo';
