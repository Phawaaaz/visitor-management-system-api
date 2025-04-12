const express = require('express');
const { check } = require('express-validator');
const { 
  registerAdmin, 
  loginAdmin, 
  getAllVisitors,
  processCheckIn,
  processCheckOut
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  registerAdmin
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginAdmin
);

router.get('/visitors', protect, authorize('admin', 'superadmin'), getAllVisitors);
router.post('/check-in', protect, authorize('admin', 'superadmin'), processCheckIn);
router.post('/check-out', protect, authorize('admin', 'superadmin'), processCheckOut);

module.exports = router;
