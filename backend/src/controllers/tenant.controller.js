const pool = require('../db');

/**
 * API 5: Get Tenant Details
 */
exports.getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user;

  try {
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const tenant = tenantResult.rows[0];

    // Authorization check
    if (
      user.role !== 'super_admin' &&
      String(user.tenantId) !== String(tenantId)
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const statsResult = await pool.query(
      `SELECT 
         (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS totalUsers,
         (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS totalProjects,
         (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) AS totalTasks`,
      [tenantId]
    );

    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.is_active ? 'active' : 'inactive',
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
        stats: {
          totalUsers: Number(statsResult.rows[0].totalusers) || 0,
          totalProjects: Number(statsResult.rows[0].totalprojects) || 0,
          totalTasks: Number(statsResult.rows[0].totaltasks) || 0
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API 6: Update Tenant
 */
exports.updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user;
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  try {
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    // Tenant admin or super admin → name only
    if (name && (user.role === 'super_admin' || String(user.tenantId) === String(tenantId))) {
      updates.push(`name = $${idx}`);
      values.push(name);
      idx++;
    }

    // Super admin only fields
    if (user.role === 'super_admin') {
      if (status !== undefined) {
        updates.push(`is_active = $${idx}`);
        values.push(status === 'active');
        idx++;
      }
      if (subscriptionPlan) {
        updates.push(`subscription_plan = $${idx}`);
        values.push(subscriptionPlan);
        idx++;
      }
      if (maxUsers !== undefined) {
        updates.push(`max_users = $${idx}`);
        values.push(maxUsers);
        idx++;
      }
      if (maxProjects !== undefined) {
        updates.push(`max_projects = $${idx}`);
        values.push(maxProjects);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No fields to update or unauthorized'
      });
    }

    // Always update updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    values.push(tenantId);

    const query = `
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, name, updated_at
    `;

    const updated = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: updated.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * API 7: List All Tenants (Super Admin)
 */
exports.listAllTenants = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;

  try {
    const tenantsResult = await pool.query(
      'SELECT * FROM tenants ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM tenants');

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    const tenantsWithStats = await Promise.all(
      tenantsResult.rows.map(async (t) => {
        const statsResult = await pool.query(
          `SELECT 
             (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS totalUsers,
             (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS totalProjects`,
          [t.id]
        );

        return {
          ...t,
          totalUsers: Number(statsResult.rows[0].totalusers) || 0,
          totalProjects: Number(statsResult.rows[0].totalprojects) || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        tenants: tenantsWithStats,
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
