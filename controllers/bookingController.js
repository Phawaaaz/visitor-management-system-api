// controllers/bookingController.js
const Booking = require('../models/Booking');
const { generateQRCode } = require('../utils/qrGenerator');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Visitor
exports.createBooking = async (req, res) => {
  try {
    const { purpose, visitDate, visitTime } = req.body;

    // Create booking
    const booking = await Booking.create({
      visitor: req.user.id,
      purpose,
      visitDate,
      visitTime
    });

    // Generate QR codes for check-in
    const checkInData = {
      type: 'check-in',
      bookingId: booking._id,
      visitorId: req.user.id,
      timestamp: new Date()
    };

    const checkInQrCode = await generateQRCode(checkInData);
    
    // Generate QR code for check-out (will be used after check-in)
    const checkOutData = {
      type: 'check-out',
      bookingId: booking._id,
      visitorId: req.user.id,
      timestamp: new Date()
    };

    const checkOutQrCode = await generateQRCode(checkOutData);

    // Update booking with QR codes
    booking.checkInQrCode = checkInQrCode;
    booking.checkOutQrCode = checkOutQrCode;
    await booking.save();

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all bookings for logged in visitor
// @route   GET /api/bookings
// @access  Private/Visitor
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ visitor: req.user.id }).sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private/Visitor
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Make sure visitor owns booking
    if (booking.visitor.toString() !== req.user.id && req.userRole !== 'admin' && req.userRole !== 'superadmin') {
      return res.status(401).json({ error: 'Not authorized to access this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Visitor
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Make sure visitor owns booking
    if (booking.visitor.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot cancel booking that is already checked in or out' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};