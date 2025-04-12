const Admin = require('../models/Admin');
const Visitor = require('../models/Visitor');
const Booking = require('../models/Booking');
const CheckInOut = require('../models/CheckInOut');
const { validationResult } = require('express-validator');

// @desc    Register admin
// @route   POST /api/admins/register
// @access  Public
exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if admin exists
    let admin = await Admin.findOne({ email });

    if (admin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    admin = await Admin.create({
      name,
      email,
      password
    });

    // Admin created but pending approval
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully. Awaiting approval from Super Admin.'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login admin
// @route   POST /api/admins/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if admin is approved
    if (admin.status !== 'approved' && !admin.isSuperAdmin) {
      return res.status(401).json({ error: 'Your account is pending approval' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    sendTokenResponse(admin, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all visitors (for admin dashboard)
// @route   GET /api/admins/visitors
// @access  Private/Admin
exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Process check-in via QR code
// @route   POST /api/admins/check-in
// @access  Private/Admin
exports.processCheckIn = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'scheduled') {
      return res.status(400).json({ error: 'Booking has already been checked in or cancelled' });
    }

    // Update booking status
    booking.status = 'checked-in';
    await booking.save();

    // Create check-in record
    const checkInOut = await CheckInOut.create({
      booking: booking._id,
      visitor: booking.visitor,
      checkinTime: new Date(),
      processedBy: req.user.id
    });

    res.status(200).json({
      success: true,
      data: {
        booking,
        checkInOut
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Process check-out via QR code
// @route   POST /api/admins/check-out
// @access  Private/Admin
exports.processCheckOut = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({ error: 'Booking is not checked in' });
    }

    // Update booking status
    booking.status = 'checked-out';
    await booking.save();

    // Update check-in/out record
    const checkInOut = await CheckInOut.findOne({ booking: booking._id });
    
    if (!checkInOut) {
      return res.status(404).json({ error: 'Check-in record not found' });
    }

    checkInOut.checkoutTime = new Date();
    await checkInOut.save();

    res.status(200).json({
      success: true,
      data: {
        booking,
        checkInOut
      }
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