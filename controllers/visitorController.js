// controllers/visitorController.js
const Visitor = require('../models/Visitor');
const { validationResult } = require('express-validator');

// @desc    Register visitor
// @route   POST /api/visitors/register
// @access  Public
exports.registerVisitor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;

  try {
    // Check if visitor exists
    let visitor = await Visitor.findOne({ email });

    if (visitor) {
      return res.status(400).json({ error: 'Visitor already exists' });
    }

    visitor = await Visitor.create({
      name,
      email,
      phone,
      password
    });

    sendTokenResponse(visitor, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login visitor
// @route   POST /api/visitors/login
// @access  Public
exports.loginVisitor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for visitor
    const visitor = await Visitor.findOne({ email }).select('+password');

    if (!visitor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await visitor.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    sendTokenResponse(visitor, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get current logged in visitor
// @route   GET /api/visitors/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
};