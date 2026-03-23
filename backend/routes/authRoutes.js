import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campusmain_secret_key_change_me'; // TODO: .env

// @desc Login user
// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Backend login attempt:', req.body, 'headers:', req.headers.authorization);
  try {
    const { id, password } = req.body;

    // Validate input
    if (!id || !password) {
      return res.status(400).json({ message: 'ID and password required' });
    }

    // Find user (exact match case insensitive)
    let user = await User.findOne({ id: { $regex: new RegExp(`^${id}$`, 'i') } });
    const isVda = id.toLowerCase().startsWith('vda');

    if (!user) {
      if (isVda) {
        const hashedPw = await bcrypt.hash(password || 'pass', 12);
        user = new User({
          id: id.toLowerCase(),
          collegeId: id.toLowerCase(),
          password: hashedPw,
          role: 'student',
          name: password // store their typed "name" here
        });
        await user.save();
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      if (!isVda) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else if (password) {
        // update their name if they re-login and provide a new name
        user.name = password;
        await user.save();
      }
    }


    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default { router, protect };
