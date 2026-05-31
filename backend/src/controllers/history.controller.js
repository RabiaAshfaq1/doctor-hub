const { MedicalHistory, Prescription, Patient, Doctor, Assistant, Appointment, User } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Retrieve patient medical history and prescriptions
 */
const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Verify patient profile exists
    const patient = await Patient.findByPk(patientId, {
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // Authorization checks:
    let isAuthorized = false;

    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.PATIENT) {
      // Patients can only view their own history
      if (patient.user_id === req.user.id) {
        isAuthorized = true;
      }
    } else if (req.user.role === ROLES.DOCTOR) {
      // Doctors can view history if they have an appointment with the patient
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (doctor) {
        const appointment = await Appointment.findOne({
          where: { patient_id: patient.id, doctor_id: doctor.id }
        });
        if (appointment) isAuthorized = true;
      }
    } else if (req.user.role === ROLES.ASSISTANT) {
      // Assistants can view if their managing doctor has an appointment
      const assistant = await Assistant.findOne({ where: { user_id: req.user.id } });
      if (assistant && assistant.doctor_id) {
        const appointment = await Appointment.findOne({
          where: { patient_id: patient.id, doctor_id: assistant.doctor_id }
        });
        if (appointment) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You do not have permission to view this patient\'s medical history.' 
      });
    }

    // Retrieve history with associated prescriptions
    const history = await MedicalHistory.findAll({
      where: { patient_id: patientId },
      include: [
        {
          model: Prescription
        },
        {
          model: Doctor,
          include: [{ model: User, attributes: ['name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, patient, history });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new medical history entry (Insert-Only)
 */
const addMedicalHistory = async (req, res, next) => {
  try {
    const { patient_id, appointment_id, diagnosis, notes } = req.body;

    if (!patient_id || !diagnosis) {
      return res.status(400).json({ success: false, message: 'patient_id and diagnosis are required.' });
    }

    // Lookup logged in Doctor profile
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only approved doctors can add medical history.' });
    }

    // Verify clinical relationship (has appointment)
    const appointment = await Appointment.findOne({
      where: { patient_id, doctor_id: doctor.id }
    });

    if (!appointment) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You can only record medical histories for patients who have appointments booked with you.' 
      });
    }

    // Create medical history entry (insert-only)
    const record = await MedicalHistory.create({
      patient_id,
      doctor_id: doctor.id,
      appointment_id: appointment_id || null,
      diagnosis,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Medical history entry created successfully. This record is finalized and cannot be modified.',
      record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add prescription connected to a medical history entry (Insert-Only)
 */
const addPrescription = async (req, res, next) => {
  try {
    const { medical_history_id, medicine_name, dosage, duration, instructions } = req.body;

    if (!medical_history_id || !medicine_name || !dosage || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'medical_history_id, medicine_name, dosage, and duration are required.' 
      });
    }

    // Lookup logged in Doctor profile
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only approved doctors can write prescriptions.' });
    }

    // Verify medical history entry exists and belongs to this doctor's clinical session
    const history = await MedicalHistory.findByPk(medical_history_id);
    if (!history) {
      return res.status(404).json({ success: false, message: 'Medical history record not found.' });
    }

    if (history.doctor_id !== doctor.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You can only append prescriptions to medical records you created.' 
      });
    }

    // Create prescription entry (insert-only)
    const prescription = await Prescription.create({
      medical_history_id,
      medicine_name,
      dosage,
      duration,
      instructions
    });

    res.status(201).json({
      success: true,
      message: 'Prescription added successfully. This record is finalized and cannot be modified.',
      prescription
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientHistory,
  addMedicalHistory,
  addPrescription
};
