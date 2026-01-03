const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* =========================
   API 1: REGISTER TENANT
========================= */
exports.registerTenant = async (req, res) => {
  console.log("🔥 Incoming registerTenant payload:", req.body); // ✅ here is correct

  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check tenant
    const tenantCheck = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Subdomain already exists' });
    }

    // Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'free', 5, 5)
       RETURNING id`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId,
        subdomain,
        adminUser: {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          fullName: userResult.rows[0].full_name,
          role: userResult.rows[0].role
        }
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

/* =========================
   API 2: LOGIN
========================= */
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    let tenantId = null;

    // If tenantSubdomain is provided, find tenant
    if (tenantSubdomain) {
      const tenantResult = await pool.query(
        'SELECT id FROM tenants WHERE subdomain = $1 AND is_active = true',
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }
      tenantId = tenantResult.rows[0].id;
    }

    // User query
    let userQuery = 'SELECT id, email, password_hash, full_name, role, is_active, tenant_id FROM users WHERE email = $1';
    const values = [email];

    if (tenantId) {
      userQuery += ' AND tenant_id = $2';
      values.push(tenantId);
    }

    const userResult = await pool.query(userQuery, values);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/* =========================
   API 3: GET CURRENT USER
========================= */
exports.getCurrentUser = async (req, res) => {
  const { userId } = req.user;

  try {
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active,
              t.id AS tenant_id, t.name AS tenant_name, t.subdomain, t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const row = userResult.rows[0];

    res.json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        isActive: row.is_active,
        tenant: row.tenant_id ? {
          id: row.tenant_id,
          name: row.tenant_name,
          subdomain: row.subdomain,
          subscriptionPlan: row.subscription_plan,
          maxUsers: row.max_users,
          maxProjects: row.max_projects
        } : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 4: LOGOUT
========================= */
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
