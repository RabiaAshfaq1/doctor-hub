const { Payment, Appointment, Patient, Assistant } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Upload payment screenshot proof
 */
const uploadPayment = async (req, res, next) => {
  try {
    const { appointment_id } = req.body;
    let screenshot_url = req.body.screenshot_url;

    if (req.file) {
      screenshot_url = `/uploads/${req.file.filename}`;
    }

    if (!appointment_id || !screenshot_url) {
      return res.status(400).json({ success: false, message: 'appointment_id and screenshot proof (file or URL) are required.' });
    }

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Verify appointment belongs to logged in Patient
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient || appointment.patient_id !== patient.id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only upload payments for your own appointments.' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot upload payment. Appointment status is currently: ${appointment.status}` });
    }

    // Create Payment record
    const payment = await Payment.create({
      appointment_id,
      screenshot_url,
      status: 'pending',
      uploaded_at: new Date()
    });

    // Transition appointment status
    appointment.status = 'payment_uploaded';
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Payment screenshot uploaded successfully. Awaiting assistant verification.',
      payment,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to check if user has rights to verify/reject this payment
 */
const checkModeratorPermission = async (user, payment) => {
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  if (user.role === ROLES.ASSISTANT) {
    const assistant = await Assistant.findOne({ where: { user_id: user.id } });
    if (!assistant) return false;

    const appointment = await Appointment.findByPk(payment.appointment_id);
    if (!appointment) return false;

    // Verify assistant belongs to the doctor of this appointment
    return assistant.doctor_id === appointment.doctor_id;
  }

  return false;
};

/**
 * Verify payment screenshot and confirm appointment
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const hasPermission = await checkModeratorPermission(req.user, payment);
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to verify this payment.' });
    }

    const appointment = await Appointment.findByPk(payment.appointment_id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Associated appointment not found.' });
    }

    // Enforce pre-condition check: status must be 'payment_uploaded'
    if (appointment.status !== 'payment_uploaded') {
      return res.status(400).json({
        success: false,
        message: `Status transition error. Expected appointment status 'payment_uploaded' but found '${appointment.status}'.`
      });
    }

    // Update payment record
    payment.status = 'verified';
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    // Enforce linear states transition: payment_uploaded -> payment_verified -> confirmed
    appointment.status = 'payment_verified';
    await appointment.save();

    appointment.status = 'confirmed'; // Auto-confirm
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Appointment auto-confirmed.',
      payment,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject payment screenshot
 */
const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const hasPermission = await checkModeratorPermission(req.user, payment);
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to reject this payment.' });
    }

    const appointment = await Appointment.findByPk(payment.appointment_id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Associated appointment not found.' });
    }

    // Enforce pre-condition check: status must be 'payment_uploaded'
    if (appointment.status !== 'payment_uploaded') {
      return res.status(400).json({
        success: false,
        message: `Status transition error. Expected appointment status 'payment_uploaded' but found '${appointment.status}'.`
      });
    }

    // Update payment record
    payment.status = 'rejected';
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    // Transition appointment to cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Payment rejected. Appointment has been cancelled.',
      payment,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPayment,
  verifyPayment,
  rejectPayment
};
