const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT config
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  // Fail fast - signing and verification MUST use the same secret.
  // A fallback here would diverge from requireAuth.js (which uses process.env directly)
  // causing all auth calls to silently fail.
  throw new Error('JWT_SECRET environment variable is required. Set it in backend/.env');
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      is_admin: user.is_admin 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, password, location } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      location: location || null
    });

    // Generate token
    const token = generateToken(user);

    // Return user data (without password) + token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          avatar: user.avatar,
          is_admin: user.is_admin,
          is_verified: user.is_verified,
          hobby_total_year: user.hobby_total_year,
          hobby_job_count: user.hobby_job_count,
          hobby_warned: user.hobby_warned,
          hobby_limit_reached: user.hobby_limit_reached,
          created_at: user.created_at,
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data + token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          avatar: user.avatar,
          is_admin: user.is_admin,
          is_verified: user.is_verified,
          hobby_total_year: user.hobby_total_year,
          hobby_job_count: user.hobby_job_count,
          hobby_warned: user.hobby_warned,
          hobby_limit_reached: user.hobby_limit_reached,
          created_at: user.created_at,
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// NOTE: JWT is stateless — the token cannot be invalidated server-side without a
// blacklist or session store. This endpoint is therefore a no-op success stub;
// the client must delete the token from its own storage. If/when server-side
// invalidation becomes a requirement, introduce a token blacklist (e.g. Redis)
// and check it in requireAuth.
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
};

// @desc    Change current user's password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'newPassword must be at least 6 characters',
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashed });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          avatar: user.avatar,
          is_admin: user.is_admin,
          is_verified: user.is_verified,
          hobby_total_year: user.hobby_total_year,
          hobby_job_count: user.hobby_job_count,
          hobby_warned: user.hobby_warned,
          hobby_limit_reached: user.hobby_limit_reached,
          created_at: user.created_at,
        }
      }
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
};
