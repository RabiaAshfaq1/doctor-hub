const { body, validationResult } = require('express-validator');

/**
 * Generic middleware to handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for registration
 */
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('role')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['patient', 'doctor', 'assistant', 'admin', 'super_admin'])
    .withMessage('Invalid role provided.'),
  body('phone')
    .optional()
    .trim(),
  body('specialization')
    .optional()
    .trim(),
  body('treatment_type')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['allopathic', 'homeopathic', 'ayurvedic'])
    .withMessage('Invalid treatment type.'),
  body('license_no')
    .optional()
    .trim(),
  body('consultation_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number.'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD).'),
  body('blood_group')
    .optional()
    .trim(),
  body('allergies')
    .optional()
    .trim(),
  body('doctor_id')
    .optional()
    .isUUID()
    .withMessage('Doctor ID must be a valid UUID.')
];

/**
 * Validation rules for login
 */
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail()
];

/**
 * Validation rules for reset password
 */
const resetPasswordValidationRules = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required.'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.')
];

/**
 * Validation rules for booking an appointment
 */
const bookAppointmentValidationRules = [
  body('doctor_id')
    .notEmpty()
    .withMessage('doctor_id is required.')
    .isUUID()
    .withMessage('doctor_id must be a valid UUID.'),
  body('clinic_id')
    .notEmpty()
    .withMessage('clinic_id is required.')
    .isUUID()
    .withMessage('clinic_id must be a valid UUID.'),
  body('scheduled_at')
    .notEmpty()
    .withMessage('scheduled_at is required.')
    .isISO8601()
    .withMessage('scheduled_at must be a valid ISO8601 date.')
];

module.exports = {
  validate,
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  bookAppointmentValidationRules
};
