const pool = require('../db');
const bcrypt = require('bcrypt');

/* =========================
   API 8: Add User to Tenant
========================= */
exports.addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { email, password, fullName, role } = req.body;
  const user = req.user; // from auth middleware

  // Only tenant_admin of this tenant can add
  if (user.role !== 'tenant_admin' || user.tenantId !== tenantId) {
    return res.status(403).json({ success: false, message: 'Forbidden: tenant_admin only' });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: 'Email, password and fullName are required' });
  }

  try {
    // Check maxUsers limit
    const tenantResult = await pool.query('SELECT max_users FROM tenants WHERE id=$1', [tenantId]);
    if (!tenantResult.rows[0]) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const maxUsers = tenantResult.rows[0].max_users;

    const userCountResult = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id=$1', [tenantId]);
    if (parseInt(userCountResult.rows[0].count, 10) >= maxUsers) {
      return res.status(403).json({ success: false, message: 'Subscription limit reached' });
    }

    // Check if email exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email=$1 AND tenant_id=$2', [email, tenantId]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists in this tenant' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertUser = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
       RETURNING id, email, full_name AS "fullName", role, tenant_id AS "tenantId", is_active AS "isActive", created_at AS "createdAt"`,
      [tenantId, email, hashedPassword, fullName, role || 'user']
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: insertUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 9: List Tenant Users
========================= */
exports.listTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user; // from auth middleware

  if (user.tenantId !== tenantId) {
    return res.status(403).json({ success: false, message: 'Forbidden: Not your tenant' });
  }

  const { search = '', role, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT id, email, full_name AS "fullName", role, is_active AS "isActive", created_at AS "createdAt" FROM users WHERE tenant_id=$1';
    const params = [tenantId];
    let idx = 2;

    if (search) {
      query += ` AND (LOWER(full_name) LIKE $${idx} OR LOWER(email) LIKE $${idx})`;
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    if (role) {
      query += ` AND role=$${idx}`;
      params.push(role);
      idx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const usersResult = await pool.query(query, params);

    const countResult = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id=$1', [tenantId]);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        total,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages,
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 10: Update User
========================= */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, role, isActive, password } = req.body;
    const requester = req.user; // from authenticate middleware

    // Fetch user to update
    const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!userResult.rowCount)
      return res.status(404).json({ success: false, message: 'User not found' });

    const user = userResult.rows[0];

    // Verify same tenant
    if (user.tenant_id !== requester.tenantId)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    // Only tenant_admin can update role & isActive
    if (!requester.role.includes('tenant_admin') && (role || isActive !== undefined)) {
      return res.status(403).json({ success: false, message: 'Cannot update role or isActive' });
    }

    // Only self or tenant_admin can update fullName
    if (!requester.role.includes('tenant_admin') && requester.userId !== userId && fullName) {
      return res.status(403).json({ success: false, message: 'Cannot update this user' });
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Build dynamic query
    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName) { fields.push(`full_name=$${idx++}`); values.push(fullName); }
    if (role && requester.role.includes('tenant_admin')) { fields.push(`role=$${idx++}`); values.push(role); }
    if (isActive !== undefined && requester.role.includes('tenant_admin')) { fields.push(`is_active=$${idx++}`); values.push(isActive); }
    if (hashedPassword) { fields.push(`password_hash=$${idx++}`); values.push(hashedPassword); }

    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Nothing to update' });

    values.push(userId); // last param for WHERE
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id=$${idx} RETURNING id, full_name AS "fullName", role, updated_at AS "updatedAt"`;
    const updated = await pool.query(query, values);

    // TODO: log in audit_logs

    return res.json({ success: true, message: 'User updated successfully', data: updated.rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* =========================
   API 11: Delete User
========================= */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requester = req.user; // from authenticate middleware

    // tenant_admin cannot delete self
    if (requester.userId === userId) {
      return res.status(403).json({ success: false, message: 'Cannot delete self' });
    }

    // Fetch user to delete
    const userResult = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!userResult.rowCount)
      return res.status(404).json({ success: false, message: 'User not found' });

    const user = userResult.rows[0];

    // Verify same tenant
    if (user.tenant_id !== requester.tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);

    // TODO: Cascade delete related data or set assigned_to=NULL in tasks
    // TODO: log in audit_logs

    return res.json({ success: true, message: 'User deleted successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
