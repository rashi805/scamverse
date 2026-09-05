function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  // Multer errors (file too large, disallowed type from the fileFilter, etc.)
  // are client mistakes, not server failures -- surface them as 400s.
  if (err.name === 'MulterError' || /File type ".*" is not allowed/.test(err.message || '')) {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
}

module.exports = { notFound, errorHandler };
