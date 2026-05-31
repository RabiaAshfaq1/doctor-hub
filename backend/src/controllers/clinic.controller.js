const { Clinic, Doctor, Assistant } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Create a new clinic associated with a doctor
 */
const createClinic = async (req, res, next) => {
  try {
    const { doctor_id, name, address, city, timings_json } = req.body;

    if (!doctor_id || !name || !address || !city) {
      return res.status(400).json({ success: false, message: 'doctor_id, name, address, and city are required.' });
    }

    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Authorization checks:
    let isAuthorized = false;
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.DOCTOR && doctor.user_id === req.user.id) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.ASSISTANT) {
      const assistant = await Assistant.findOne({ where: { user_id: req.user.id } });
      if (assistant && assistant.doctor_id === doctor.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to manage clinics for this doctor.' });
    }

    const newClinic = await Clinic.create({
      doctor_id,
      name,
      address,
      city,
      timings_json: timings_json || {}
    });

    res.status(201).json({ success: true, message: 'Clinic created successfully.', clinic: newClinic });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit clinic details
 */
const updateClinic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, city, timings_json } = req.body;

    const clinic = await Clinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found.' });
    }

    const doctor = await Doctor.findByPk(clinic.doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Associated doctor not found.' });
    }

    // Authorization checks:
    let isAuthorized = false;
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.DOCTOR && doctor.user_id === req.user.id) {
      isAuthorized = true;
    } else if (req.user.role === ROLES.ASSISTANT) {
      const assistant = await Assistant.findOne({ where: { user_id: req.user.id } });
      if (assistant && assistant.doctor_id === doctor.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to edit clinics for this doctor.' });
    }

    if (name) clinic.name = name;
    if (address) clinic.address = address;
    if (city) clinic.city = city;
    if (timings_json) clinic.timings_json = timings_json;

    await clinic.save();

    res.status(200).json({ success: true, message: 'Clinic details updated successfully.', clinic });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClinic,
  updateClinic
};
