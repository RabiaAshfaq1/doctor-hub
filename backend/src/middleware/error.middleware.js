const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    let message = `File upload error: ${err.message}`;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded. Maximum file size allowed is 5MB.';
    }
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Handle custom upload/mime-type filter errors
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  // Handle JWT errors outside of auth middleware if any
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials or token.'
    });
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
