/**
 * Centralized Express error handler.
 * Always responds in the `{ success: false, message }` format.
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.message || "Something went wrong. Please try again later.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;

