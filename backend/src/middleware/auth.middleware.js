const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Token missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, tenantId, role }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const authorizeTenantAdmin = (req, res, next) => {
  if (req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin only' });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeTenantAdmin,
  authorizeSuperAdmin
};
