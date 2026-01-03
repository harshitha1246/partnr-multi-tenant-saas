const express = require('express');
const router = express.Router();

const tenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeTenantAdmin, authorizeSuperAdmin } = require('../middleware/tenant.middleware');

// API 5: Get Tenant Details
router.get('/:tenantId', authenticate, authorizeTenantAdmin, tenantController.getTenantDetails);

// API 6: Update Tenant
router.put('/:tenantId', authenticate, authorizeTenantAdmin, tenantController.updateTenant);

// API 7: List All Tenants (super_admin only)
router.get('/', authenticate, authorizeSuperAdmin, tenantController.listAllTenants);

module.exports = router;
