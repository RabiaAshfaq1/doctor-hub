const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');

// Public/Patient routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes
router.put('/:id', authenticate, authorize(ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN), doctorController.updateDoctor);
router.patch('/:id/approve', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), doctorController.approveDoctor);

module.exports = router;
