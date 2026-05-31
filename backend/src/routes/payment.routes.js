const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../utils/constants');
const upload = require('../middleware/upload.middleware');

// Upload screenshot (Patients only)
router.post('/', authenticate, authorize(ROLES.PATIENT), upload.single('screenshot'), paymentController.uploadPayment);

// Verify and confirm booking (Assistants, Admins, Super Admins)
router.patch('/:id/verify', authenticate, authorize(ROLES.ASSISTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN), paymentController.verifyPayment);

// Reject payment screenshot (Assistants, Admins, Super Admins)
router.patch('/:id/reject', authenticate, authorize(ROLES.ASSISTANT, ROLES.ADMIN, ROLES.SUPER_ADMIN), paymentController.rejectPayment);

module.exports = router;
