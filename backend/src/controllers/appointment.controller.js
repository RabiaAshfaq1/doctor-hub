const { Appointment, Patient, Doctor, Clinic, User, Assistant, Payment } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Book a new appointment
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctor_id, clinic_id, scheduled_at } = req.body;

    if (!doctor_id || !clinic_id || !scheduled_at) {
      return res.status(400).json({ success: false, message: 'doctor_id, clinic_id, and scheduled_at are required.' });
    }

    // Patient ID lookup
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(400).json({ success: false, message: 'Your account is not configured as a Patient.' });
    }

    // Verify Doctor exists and is approved
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor || !doctor.is_approved) {
      return res.status(404).json({ success: false, message: 'Doctor is not available or not approved.' });
    }

    // Verify Clinic exists and is managed by this Doctor
    const clinic = await Clinic.findByPk(clinic_id);
    if (!clinic || clinic.doctor_id !== doctor.id) {
      return res.status(400).json({ success: false, message: 'The selected clinic is invalid for this doctor.' });
    }

    // Create appointment (starts in 'pending' status)
    const appointment = await Appointment.create({
      patient_id: patient.id,
      doctor_id,
      clinic_id,
      scheduled_at,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Please proceed with payment upload.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve appointments belonging to the logged in user's role
 */
const getMyAppointments = async (req, res, next) => {
  try {
    let whereClause = {};

    if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patient) return res.status(400).json({ success: false, message: 'Patient profile not found.' });
      whereClause.patient_id = patient.id;
    } else if (req.user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor) return res.status(400).json({ success: false, message: 'Doctor profile not found.' });
      whereClause.doctor_id = doctor.id;
    } else if (req.user.role === ROLES.ASSISTANT) {
      const assistant = await Assistant.findOne({ where: { user_id: req.user.id } });
      if (!assistant || !assistant.doctor_id) {
        return res.status(400).json({ success: false, message: 'Assistant is not linked to any active Doctor.' });
      }
      whereClause.doctor_id = assistant.doctor_id;
    }

    // For Admin / Super Admin, whereClause is empty (lists all appointments)

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
        },
        {
          model: Doctor,
          include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
        },
        {
          model: Clinic
        },
        {
          model: Payment,
          attributes: ['id', 'screenshot_url', 'status', 'uploaded_at']
        }
      ],
      order: [['scheduled_at', 'ASC']]
    });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot cancel an appointment that is already ${appointment.status}.` });
    }

    // Authorization checks:
    let isAuthorized = false;

    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.PATIENT) {
      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (patient && appointment.patient_id === patient.id) {
        isAuthorized = true;
      }
    } else if (req.user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (doctor && appointment.doctor_id === doctor.id) {
        isAuthorized = true;
      }
    } else if (req.user.role === ROLES.ASSISTANT) {
      const assistant = await Assistant.findOne({ where: { user_id: req.user.id } });
      if (assistant && appointment.doctor_id === assistant.doctor_id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to cancel this appointment.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled successfully.', appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark appointment as completed (Doctor only)
 */
const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Enforce strict pre-condition: Must be in 'confirmed' status
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: `Status transition error: Cannot complete appointment. Expected status 'confirmed' but found '${appointment.status}'.` 
      });
    }

    // Authorization: Only the assigned Doctor can complete this appointment
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor || appointment.doctor_id !== doctor.id) {
      return res.status(403).json({ success: false, message: 'Forbidden. Only the assigned doctor can complete this appointment.' });
    }

    appointment.status = 'completed';
    await appointment.save();

    res.status(200).json({ 
      success: true, 
      message: 'Appointment status transitioned to completed successfully.', 
      appointment 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  completeAppointment
};
