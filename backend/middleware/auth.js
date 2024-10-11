const jwt = require("jsonwebtoken");
const HttpError = require("../models/httpError");

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Authentication failed");
  }
  return authHeader.split(" ")[1]; // Authorization: 'Bearer TOKEN'
};

const verifyToken = (token) => {
  return jwt.verify(token, "supersecret_dont_share");
};

const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = extractToken(req);
    if (!token) {
      throw new Error("Authentication failed");
    }
    const decodedToken = verifyToken(token);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 403);
    return next(error);
  }
};

module.exports = authMiddleware;
