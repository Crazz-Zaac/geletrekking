const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { getAlertColorPreset } = require('../utils/alertColorPresets');
const authMiddleware = require('../middleware/authMiddleware');
const restrictToRoles = require('../middleware/roleMiddleware');

// ✅ GET ALL ACTIVE ALERTS (PUBLIC)
// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET ALERT BY TYPE (PUBLIC)
// GET /api/alerts/type/:type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const alerts = await Alert.find({ 
      isActive: true, 
      type 
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET ALL ALERTS (ADMIN)
// GET /api/alerts/admin/all
router.get('/admin/all', authMiddleware, restrictToRoles('admin', 'superadmin'), async (req, res) => {
  try {
    const alerts = await Alert.find({})
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ CREATE ALERT (ADMIN)
// POST /api/alerts
router.post('/', authMiddleware, restrictToRoles('admin', 'superadmin'), async (req, res) => {
  try {
    const { title, message, icon, type, isActive, priority, ctaUrl, ctaLabel } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const resolvedIcon = icon || 'info';
    const preset = getAlertColorPreset(resolvedIcon);

    const alert = new Alert({
      title,
      message,
      icon: resolvedIcon,
      type: type || 'global',
      isActive: isActive !== undefined ? isActive : true,
      backgroundColor: preset.backgroundColor,
      textColor: preset.titleColor,
      borderColor: preset.borderColor,
      accentColor: preset.accentColor,
      titleColor: preset.titleColor,
      bodyColor: preset.bodyColor,
      priority: priority || 0,
      ctaUrl,
      ctaLabel,
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE ALERT (ADMIN)
// PUT /api/alerts/:id
router.put('/:id', authMiddleware, restrictToRoles('admin', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, icon, type, isActive, priority, ctaUrl, ctaLabel } = req.body;

    const existingAlert = await Alert.findById(id).lean();
    if (!existingAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const resolvedIcon = icon || existingAlert.icon || 'info';
    const preset = getAlertColorPreset(resolvedIcon);

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        title: title !== undefined ? title : existingAlert.title,
        message: message !== undefined ? message : existingAlert.message,
        icon: resolvedIcon,
        type: type !== undefined ? type : existingAlert.type,
        isActive: isActive !== undefined ? isActive : existingAlert.isActive,
        backgroundColor: preset.backgroundColor,
        textColor: preset.titleColor,
        borderColor: preset.borderColor,
        accentColor: preset.accentColor,
        titleColor: preset.titleColor,
        bodyColor: preset.bodyColor,
        priority: priority !== undefined ? priority : existingAlert.priority,
        ctaUrl: ctaUrl !== undefined ? ctaUrl : existingAlert.ctaUrl,
        ctaLabel: ctaLabel !== undefined ? ctaLabel : existingAlert.ctaLabel,
      },
      { new: true }
    );

    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE ALERT (ADMIN)
// DELETE /api/alerts/:id
router.delete('/:id', authMiddleware, restrictToRoles('admin', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
