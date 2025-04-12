const Admin = require('../models/Admin');

// @desc    Get all pending admin registrations
// @route   GET /api/super-admin/pending-admins
// @access  Private/SuperAdmin
exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ status: 'pending' });
    
    res.status(200).json({
      success: true,
      count: pendingAdmins.length,
      data: pendingAdmins
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Approve or reject admin
// @route   PUT /api/super-admin/admin/:id
// @access  Private/SuperAdmin
exports.updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    admin.status = status;
    await admin.save();

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create super admin (one-time setup)
// @route   POST /api/super-admin/setup
// @access  Public (should be secured or removed after initial setup)
exports.setupSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if super admin already exists
    const superAdminExists = await Admin.findOne({ isSuperAdmin: true });
    
    if (superAdminExists) {
      return res.status(400).json({ error: 'Super admin already exists' });
    }

    const superAdmin = await Admin.create({
      name,
      email,
      password,
      isSuperAdmin: true,
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      message: 'Super admin created successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
