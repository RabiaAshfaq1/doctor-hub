const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');

// Apply admin protection to all routes in this router
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

// List users
router.get('/users', adminController.getUsers);

// Approve/Block user (or toggle doctor status)
router.patch('/users/:id/status', adminController.toggleUserStatus);

// View system reports and analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
