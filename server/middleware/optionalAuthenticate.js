// middleware/optionalAuthenticate.js
const jwt = require("jsonwebtoken");

const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      console.warn("Invalid token:", err.message);
    }
  }

  next();
};

module.exports = optionalAuthenticate;
