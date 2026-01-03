/**
 * Middleware to authorize tenant admin for tenant-specific actions
 */
const authorizeTenantAdmin = (req, res, next) => {
  const user = req.user;
  const tenantId = req.params.tenantId;

  // tenant_admin can only access their own tenant
  if (user.role === 'tenant_admin' && user.tenantId !== tenantId) {
    return res.status(403).json({ success: false, message: 'Unauthorized: cannot access other tenant' });
  }

  next();
};

/**
 * Middleware to authorize super admin for global actions
 */
const authorizeSuperAdmin = (req, res, next) => {
  const user = req.user;

  if (user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: super_admin only' });
  }

  next();
};

module.exports = { authorizeTenantAdmin, authorizeSuperAdmin };
