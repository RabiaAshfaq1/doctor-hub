const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');
const { validate, bookAppointmentValidationRules } = require('../middleware/validation.middleware');

// Book appointment (Patients only)
router.post('/', authenticate, authorize(ROLES.PATIENT), bookAppointmentValidationRules, validate, appointmentController.bookAppointment);

// View list of appointments related to role (Any logged-in user)
router.get('/my', authenticate, appointmentController.getMyAppointments);

// Cancel appointment (Patients, Doctors, Assistants, Admins)
router.patch('/:id/cancel', authenticate, appointmentController.cancelAppointment);

// Complete appointment (Doctors only)
router.patch('/:id/complete', authenticate, authorize(ROLES.DOCTOR), appointmentController.completeAppointment);

module.exports = router;
