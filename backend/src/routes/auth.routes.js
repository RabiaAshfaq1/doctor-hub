const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validate,
  registerValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', registerValidationRules, validate, authController.register);
router.post('/login', loginValidationRules, validate, authController.login);
router.post('/forgot-password', forgotPasswordValidationRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidationRules, validate, authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
