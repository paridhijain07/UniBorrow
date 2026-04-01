const jwt = require("jsonwebtoken");

/**
 * Verify JWT from `Authorization: Bearer <token>` and attach `req.user`.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid token",
    });
  }
};

module.exports = auth;

