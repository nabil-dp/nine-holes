const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/errors');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new UnauthorizedError('User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(err);
  }
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { protect, generateToken };
