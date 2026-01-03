const pool = require('./'); // index.js
const bcrypt = require('bcrypt');

const seedData = async () => {
  try {
    const superAdminHash = await bcrypt.hash('superpassword123', 10);
    await pool.query(`
      INSERT INTO users (tenant_id, email, password, role)
      VALUES (NULL, 'superadmin@example.com', '${superAdminHash}', 'super_admin')
      ON CONFLICT DO NOTHING;
    `);

    const tenantResult = await pool.query(`
      INSERT INTO tenants (name, max_users)
      VALUES ('TenantA', 5)
      RETURNING id
    `);
    const tenantId = tenantResult.rows[0].id;

    const tenantAdminHash = await bcrypt.hash('tenantadmin123', 10);
    await pool.query(`
      INSERT INTO users (tenant_id, email, password, role)
      VALUES (${tenantId}, 'tenantadmin@example.com', '${tenantAdminHash}', 'tenant_admin')
    `);

    const userHash = await bcrypt.hash('user123', 10);
    await pool.query(`
      INSERT INTO users (tenant_id, email, password, role)
      VALUES (${tenantId}, 'user@example.com', '${userHash}', 'user')
    `);

    console.log('Seed data inserted successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

module.exports = seedData;
