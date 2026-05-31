const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, Doctor, Patient, Assistant } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Generate a JWT token for the user
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user and auto-create their corresponding profile
 */
const register = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ where: { email } }, { transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const finalRole = role ? role.toLowerCase() : ROLES.PATIENT;

    // Check super admin limit
    if (finalRole === ROLES.SUPER_ADMIN) {
      const superAdminCount = await User.count({ where: { role: ROLES.SUPER_ADMIN } }, { transaction });
      if (superAdminCount > 0) {
        await transaction.rollback();
        return res.status(403).json({ success: false, message: 'Super Admin registration is disabled.' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role: finalRole,
      phone
    }, { transaction });

    // Handle sub-profile creation depending on role
    if (finalRole === ROLES.DOCTOR) {
      await Doctor.create({
        user_id: user.id,
        specialization: req.body.specialization || 'General Practitioner',
        treatment_type: req.body.treatment_type || 'allopathic',
        license_no: req.body.license_no || 'PENDING',
        bio: req.body.bio || '',
        is_approved: false,
        consultation_fee: req.body.consultation_fee || 0.0
      }, { transaction });
    } else if (finalRole === ROLES.PATIENT) {
      await Patient.create({
        user_id: user.id,
        dob: req.body.dob || null,
        blood_group: req.body.blood_group || '',
        allergies: req.body.allergies || ''
      }, { transaction });
    } else if (finalRole === ROLES.ASSISTANT) {
      await Assistant.create({
        user_id: user.id,
        doctor_id: req.body.doctor_id || null
      }, { transaction });
    }

    await transaction.commit();

    const isPendingApproval = finalRole === ROLES.DOCTOR;

    res.status(201).json({
      success: true,
      message: isPendingApproval 
        ? 'Registration successful! Your doctor profile is pending admin approval before you can log in.' 
        : 'Registration successful! You can now log in.',
      user
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Doctor },
        { model: Patient },
        { model: Assistant }
      ]
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Verify approval status for doctors
    if (user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ where: { user_id: user.id } });
      if (!doctor || !doctor.is_approved) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your account is pending admin approval. Please contact support.' 
        });
      }
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send password reset token (Mock)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if user doesn't exist, just return success
      return res.status(200).json({ 
        success: true, 
        message: 'If that email exists, we have sent a password reset token.' 
      });
    }

    // Generate token valid for 1 hour
    const token = crypto.randomBytes(20).toString('hex');
    user.reset_token = token;
    user.reset_token_expires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    console.log(`[PASS_RESET_MOCK]: Token for ${email} is: ${token}`);

    res.status(200).json({
      success: true,
      message: 'If that email exists, we have sent a password reset token.',
      // Returning token in dev environment for testing convenience
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and newPassword are required.' });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile
};
