const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({ success: false, message: 'Validation error', errors });
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  return res.status(statusCode).json({ success: false, message });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

module.exports = { errorHandler, notFound };
