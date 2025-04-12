const express = require('express');
const { 
  getPendingAdmins, 
  updateAdminStatus,
  setupSuperAdmin
} = require('../controllers/superAdminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/pending-admins', protect, authorize('superadmin'), getPendingAdmins);
router.put('/admin/:id', protect, authorize('superadmin'), updateAdminStatus);
router.post('/setup', setupSuperAdmin);

module.exports = router;