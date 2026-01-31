const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(message, statusCode);
  }

  // Log error
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]({
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Send response
  const response = {
    success: false,
    error: error.message,
    statusCode: error.statusCode
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Include validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(error.statusCode).json(response);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
