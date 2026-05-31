const jwt = require('jsonwebtoken');
const { User, Doctor } = require('../models');
const { ROLES } = require('../utils/constants');

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user to verify existence with sub-profiles
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: require('../models').Doctor },
        { model: require('../models').Patient },
        { model: require('../models').Assistant }
      ]
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session invalid or user deleted.' });
    }

    // If user is a Doctor, verify their registration is approved
    if (user.role === ROLES.DOCTOR) {
      const doctor = await Doctor.findOne({ where: { user_id: user.id } });
      if (!doctor || !doctor.is_approved) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Your doctor account is pending admin approval.' 
        });
      }
    }

    // Attach user information to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

/**
 * Middleware to restrict route access by role
 * @param {...string} allowedRoles List of roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized request.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
