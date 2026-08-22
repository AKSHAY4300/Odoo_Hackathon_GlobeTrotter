const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'globetrotter_jwt_secret_dev_key_2026_super_secure_token',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const authController = {
  async signup(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide name, email, and password.',
        });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists.',
        });
      }

      const passwordHash = await User.hashPassword(password);
      const user = new User({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        savedCityIds: ['city-paris', 'city-tokyo'],
      });

      await user.save();
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide email and password.',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Please provide your account email.',
        });
      }

      const resetToken = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[AUTH STUB] Generated Password Reset Token for ${email}: ${resetToken}`);

      res.status(200).json({
        success: true,
        message: 'Password reset token generated and logged.',
        resetToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res) {
    res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  },

  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      delete updates.password;
      delete updates.passwordHash;
      delete updates.role;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        user: updatedUser.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleSavedCity(req, res, next) {
    try {
      const { cityId } = req.body;
      const user = await User.findById(req.user._id);

      const exists = user.savedCityIds.includes(cityId);
      if (exists) {
        user.savedCityIds = user.savedCityIds.filter((id) => id !== cityId);
      } else {
        user.savedCityIds.push(cityId);
      }

      await user.save();

      res.status(200).json({
        success: true,
        savedCityIds: user.savedCityIds,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
