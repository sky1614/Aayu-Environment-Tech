const { ZodError } = require('zod');
const config = require('../config');

const JWT_ERROR_NAMES = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'];

function isSqliteConstraintError(err) {
  const code = err.code || err.rawCode || '';
  const message = err.message || '';
  return String(code).includes('SQLITE_CONSTRAINT') || message.includes('SQLITE_CONSTRAINT');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.issues,
    });
  }

  if (JWT_ERROR_NAMES.includes(err.name)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }

  if (isSqliteConstraintError(err)) {
    return res.status(409).json({
      success: false,
      error: 'Conflict: record already exists or violates a constraint',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 || config.NODE_ENV !== 'production'
    ? (err.message || 'Internal Server Error')
    : 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
