const express = require('express');
const { 
  createBooking, 
  getMyBookings, 
  getBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('visitor'), createBooking);
router.get('/', protect, authorize('visitor'), getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, authorize('visitor'), cancelBooking);

module.exports = router;