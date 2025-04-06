const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Token headerdan olinadi
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token topilmadi' });
    }

    // Token tekshiriladi
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User bazadan topiladi
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    }

    // Request ga user qo'shiladi
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Avtorizatsiya xatosi' });
  }
}; 