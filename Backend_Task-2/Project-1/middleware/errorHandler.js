// Centralized error handling middleware.

// 404 handler — for unmatched routes
exports.notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// General error handler
exports.errorHandler = (err, req, res, next) => {
  // Mongoose validation error -> 400 with field messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose bad ObjectId cast -> 400
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate field value' });
  }

  console.error(err);
  return res
    .status(err.statusCode || 500)
    .json({ success: false, message: err.message || 'Internal server error' });
};
