const express = require('express');
const router = express.Router();

const { authenticate, authorizeTenantAdmin } = require('../middleware/auth.middleware');
const { addUserToTenant, listTenantUsers } = require('../controllers/user.controller');

// API 8: Add user to tenant (TENANT ADMIN ONLY)
router.post(
  '/tenants/:tenantId/users',
  authenticate,
  authorizeTenantAdmin,
  addUserToTenant
);

// API 9: List users of a tenant
router.get(
  '/tenants/:tenantId/users',
  authenticate,
  authorizeTenantAdmin,
  listTenantUsers
);

// ---------------- API 10: Update User ----------------
// PUT /api/users/:userId
// Authorization: tenant_admin OR self
const { updateUser, deleteUser } = require('../controllers/user.controller');
router.put(
  '/users/:userId',
  authenticate,
  updateUser
);

// ---------------- API 11: Delete User ----------------
// DELETE /api/users/:userId
// Authorization: tenant_admin only
router.delete(
  '/users/:userId',
  authenticate,
  authorizeTenantAdmin,
  deleteUser
);

module.exports = router;
