const { Doctor, User, Clinic, Assistant } = require('../models');
const { ROLES } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Get all doctors with filters (specialization, treatment_type)
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, treatment_type, search } = req.query;

    const doctorQuery = { is_approved: true };
    const userQuery = {};

    if (specialization) {
      doctorQuery.specialization = { [Op.like]: `%${specialization}%` };
    }

    if (treatment_type) {
      doctorQuery.treatment_type = treatment_type.toLowerCase();
    }

    if (search) {
      userQuery.name = { [Op.like]: `%${search}%` };
    }

    const doctors = await Doctor.findAll({
      where: doctorQuery,
      include: [
        {
          model: User,
          where: userQuery,
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Clinic,
          attributes: ['id', 'name', 'address', 'city', 'timings_json']
        }
      ]
    });

    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single doctor profile details
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone']
        },
        {
          model: Clinic
        }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { specialization, treatment_type, license_no, bio, consultation_fee, name, phone } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Authorization checks:
    // 1. Logged in user is the Doctor themselves
    // 2. Logged in user is an Assistant assigned to this Doctor
    // 3. Logged in user is an Admin or Super Admin
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
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to edit this profile.' });
    }

    // Update doctor attributes
    if (specialization) doctor.specialization = specialization;
    if (treatment_type) doctor.treatment_type = treatment_type.toLowerCase();
    if (license_no) doctor.license_no = license_no;
    if (bio) doctor.bio = bio;
    if (consultation_fee !== undefined) doctor.consultation_fee = consultation_fee;

    await doctor.save();

    // Optionally update associated user name and phone if provided
    const user = await User.findByPk(doctor.user_id);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully.', 
      doctor: await Doctor.findByPk(id, { include: [User] }) 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject Doctor registration
 */
const approveDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // boolean

    if (approve === undefined) {
      return res.status(400).json({ success: false, message: 'Field "approve" (boolean) is required in request body.' });
    }

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    doctor.is_approved = !!approve;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: doctor.is_approved 
        ? 'Doctor profile registration approved successfully.' 
        : 'Doctor profile registration rejected/suspended.',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  approveDoctor
};
