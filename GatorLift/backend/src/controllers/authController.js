const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received registration request for email:', email); // Debug log

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Email already registered:', email); // Debug log
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const userId = await User.create(email, password);
    console.log('Created new user with ID:', userId); // Debug log
    
    const token = generateToken(userId);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Server error during registration:', error); // Debug log
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ token, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

const verifyToken = async (req, res) => {
  try {
    // The auth middleware will have already verified the token
    // and added the user id to req.user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyToken
}; 