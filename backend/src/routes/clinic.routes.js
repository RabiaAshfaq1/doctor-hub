const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');

// Protected routes
router.post('/', authenticate, authorize(ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN), clinicController.createClinic);
router.put('/:id', authenticate, authorize(ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN), clinicController.updateClinic);

module.exports = router;
