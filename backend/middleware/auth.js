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

const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin privileges required",
    });
  }
  return next();
};

module.exports = auth;
module.exports.auth = auth;
module.exports.admin = admin;

