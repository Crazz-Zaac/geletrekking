const mongoose = require('mongoose');

const travelGuideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['Logistics', 'Health', 'Preparation', 'Legal', 'Communication', 'Safety'],
      required: true,
    },
    description: { type: String, default: '' },
    icon: { type: String, default: 'BookOpen' },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
    region: {
      type: String,
      enum: ['Everest', 'Annapurna', 'Langtang', 'Mustang', 'General'],
      default: 'General',
    },
    relatedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TravelGuide' }],
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

travelGuideSchema.index({ category: 1, order: 1 });

module.exports = mongoose.models.TravelGuide || mongoose.model('TravelGuide', travelGuideSchema);
