const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  purpose: {
    type: String,
    required: [true, 'Please add a purpose for your visit']
  },
  visitDate: {
    type: Date,
    required: [true, 'Please add a visit date']
  },
  visitTime: {
    type: String,
    required: [true, 'Please add a visit time']
  },
  checkInQrCode: {
    type: String,
    default: null
  },
  checkOutQrCode: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'checked-in', 'checked-out', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema)