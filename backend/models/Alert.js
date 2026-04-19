const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      enum: ['info', 'warning', 'error', 'success', 'alert', 'announcement', 'critical', 'neutral'],
      default: 'info',
    },
    type: {
      type: String,
      enum: ['global', 'destinations'],
      default: 'global',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: '#3B82F6', // blue-500
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
    borderColor: {
      type: String,
      default: '#1E40AF',
    },
    accentColor: {
      type: String,
      default: '#185FA5',
    },
    titleColor: {
      type: String,
      default: '#0C447C',
    },
    bodyColor: {
      type: String,
      default: '#185FA5',
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    ctaUrl: {
      type: String,
      default: '/updates',
    },
    ctaLabel: {
      type: String,
      default: 'View full details on our Updates page →',
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
