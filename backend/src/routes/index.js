const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const doctorRoutes = require('./doctor.routes');
const clinicRoutes = require('./clinic.routes');
const appointmentRoutes = require('./appointment.routes');
const paymentRoutes = require('./payment.routes');
const historyRoutes = require('./history.routes');
const adminRoutes = require('./admin.routes');

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    message: 'Doctor Hub Server is healthy and running.',
    timestamp: new Date().toISOString()
  });
});

// Register routers
router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/clinics', clinicRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

// History routes contains paths: /history/:patientId, /history, /prescriptions
// We mount them under the base path to preserve the requested routing format exactly.
router.use('/', historyRoutes);

module.exports = router;
