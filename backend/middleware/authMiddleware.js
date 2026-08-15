const jwt = require('jsonwebtoken');
require('dotenv').config();

// Protects routes: checks for a valid JWT in the Authorization header
// Expected header format: "Authorization: Bearer <token>"
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the logged-in user's id to the request so controllers can use it
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = authMiddleware;
