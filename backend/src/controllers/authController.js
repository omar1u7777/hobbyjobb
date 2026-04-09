const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/responseHelper');
function generateToken(user) { return jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); }
module.exports = {
  async register(req, res, next) {
    try {
      const { name, email, password, location, lat, lng } = req.body;
      if (!name || !email || !password) return error(res, 'Name, email, and password are required');
      const existing = await User.findOne({ where: { email } });
      if (existing) return error(res, 'Email already registered', 409);
      const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), location, lat, lng });
      return success(res, { message: 'Account created', token: generateToken(user), user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } }, 201);
    } catch (err) { next(err); }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return error(res, 'Email and password are required');
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) return error(res, 'Invalid email or password', 401);
      return success(res, { message: 'Login successful', token: generateToken(user), user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
    } catch (err) { next(err); }
  },
  async logout(req, res) { return success(res, { message: 'Logged out' }); },
  async getMe(req, res, next) {
    try { const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } }); return success(res, { user }); } catch (err) { next(err); }
  },
};
