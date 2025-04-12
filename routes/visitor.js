const express = require('express');
const { check } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const { 
  registerVisitor, 
  loginVisitor, 
  getMe 
} = require('../controllers/visitorController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  registerVisitor
);
router.use('/login', swaggerUi.serve);
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginVisitor
);

router.get('/me', protect, getMe);

module.exports = router;