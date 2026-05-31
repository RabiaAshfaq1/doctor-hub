const { User, Doctor, Patient, Appointment, Payment, Clinic } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Get all registered users in the system (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role.toLowerCase();
    }

    const includeModels = [];
    if (role === 'doctor') {
      includeModels.push({
        model: Doctor,
        attributes: ['id', 'specialization', 'treatment_type', 'license_no', 'is_approved', 'consultation_fee']
      });
    }

    const users = await User.findAll({
      where: filter,
      attributes: ['id', 'name', 'email', 'role', 'phone', 'created_at'],
      include: includeModels,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user approval status (specifically Doctor approval)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // boolean

    if (approve === undefined) {
      return res.status(400).json({ success: false, message: 'Field "approve" (boolean) is required in request body.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ where: { user_id: user.id } });
      if (doctor) {
        doctor.is_approved = !!approve;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `User status updated successfully. Approval state: ${approve}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch dashboard analytics reports
 */
const getAnalytics = async (req, res, next) => {
  try {
    const patientCount = await Patient.count();
    const doctorCount = await Doctor.count();
    const approvedDoctorCount = await Doctor.count({ where: { is_approved: true } });
    const clinicCount = await Clinic.count();
    const appointmentCount = await Appointment.count();

    // Group appointments by status
    const statusCounts = await Appointment.findAll({
      attributes: [
        'status',
        [Appointment.sequelize.fn('COUNT', Appointment.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Sum of all verified consultation fees (mock calculation from payments / doctor fees)
    // Find all verified payments
    const verifiedPayments = await Payment.findAll({
      where: { status: 'verified' },
      include: [{
        model: Appointment,
        attributes: ['doctor_id'],
        include: [{ model: Doctor, attributes: ['consultation_fee'] }]
      }]
    });

    let totalRevenue = 0;
    verifiedPayments.forEach(p => {
      if (p.Appointment && p.Appointment.Doctor) {
        totalRevenue += parseFloat(p.Appointment.Doctor.consultation_fee || 0);
      }
    });

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          patients: patientCount,
          total_doctors: doctorCount,
          approved_doctors: approvedDoctorCount
        },
        clinics: clinicCount,
        appointments: {
          total: appointmentCount,
          by_status: statusCounts.reduce((acc, current) => {
            acc[current.status] = parseInt(current.getDataValue('count'));
            return acc;
          }, {})
        },
        financials: {
          total_revenue: totalRevenue.toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
  getAnalytics
};
