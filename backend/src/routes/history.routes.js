const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');

// Retrieve patient history (Patients, Doctors, Assistants, Admins)
router.get('/history/:patientId', authenticate, historyController.getPatientHistory);

// Create medical history record (Doctors only)
router.post('/history', authenticate, authorize(ROLES.DOCTOR), historyController.addMedicalHistory);

// Add prescription record (Doctors only)
router.post('/prescriptions', authenticate, authorize(ROLES.DOCTOR), historyController.addPrescription);

// Block DELETE requests on medical history and prescriptions with 405 Method Not Allowed
const methodNotAllowed = (req, res) => {
  return res.status(405).json({
    success: false,
    message: 'Method Not Allowed. Deleting medical history or prescription records is prohibited.'
  });
};

router.delete('/history', methodNotAllowed);
router.delete('/history/:id', methodNotAllowed);
router.delete('/prescriptions', methodNotAllowed);
router.delete('/prescriptions/:id', methodNotAllowed);

module.exports = router;
