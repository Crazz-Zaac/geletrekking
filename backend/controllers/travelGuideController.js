const mongoose = require('mongoose');
const TravelGuide = require('../models/TravelGuide');
const { planYourTripGuides } = require('../data/plan-your-trip-data');

const GUIDE_CATEGORIES = ['Logistics', 'Health & Safety', 'Preparation', 'Guidelines', 'Legal', 'Communication', 'Safety', 'Health'];
const GUIDE_REGIONS = ['Everest', 'Annapurna', 'Langtang', 'Mustang', 'General'];
const allowedFields = ['title', 'slug', 'category', 'description', 'icon', 'content', 'order', 'region', 'section', 'relatedGuides', 'isActive'];

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const pickAllowedFields = (payload = {}) => {
  const picked = {};
  for (const key of allowedFields) {
    if (typeof payload[key] !== 'undefined') picked[key] = payload[key];
  }
  return picked;
};

const normalizeGuidePayload = (payload = {}, options = {}) => {
  const { autoSlug = false, fallbackOrder = 0 } = options;
  const data = pickAllowedFields(payload);
  const normalized = {};

  if (typeof data.title !== 'undefined') normalized.title = String(data.title || '').trim();
  if (typeof data.slug !== 'undefined') normalized.slug = slugify(data.slug);
  if (autoSlug && !normalized.slug && normalized.title) normalized.slug = slugify(normalized.title);
  if (typeof data.category !== 'undefined') {
    const category = String(data.category || '').trim();
    normalized.category = GUIDE_CATEGORIES.includes(category) ? category : 'Preparation';
  }
  if (typeof data.description !== 'undefined') normalized.description = String(data.description || '').trim();
  if (typeof data.icon !== 'undefined') normalized.icon = String(data.icon || '').trim() || 'BookOpen';
  if (typeof data.content !== 'undefined') normalized.content = String(data.content || '').trim();
  if (typeof data.order !== 'undefined') normalized.order = Number.isFinite(Number(data.order)) ? Number(data.order) : fallbackOrder;
  if (typeof data.region !== 'undefined') {
    const region = String(data.region || '').trim();
    normalized.region = GUIDE_REGIONS.includes(region) ? region : 'General';
  }
  if (typeof data.section !== 'undefined') normalized.section = String(data.section || '').trim();
  if (typeof data.relatedGuides !== 'undefined') {
    normalized.relatedGuides = Array.isArray(data.relatedGuides)
      ? data.relatedGuides.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];
  }
  if (typeof data.isActive !== 'undefined') normalized.isActive = !!data.isActive;

  return normalized;
};

const guideResponse = (guideDoc) => {
  const guide = guideDoc.toObject ? guideDoc.toObject() : guideDoc;
  return {
    ...guide,
    _id: guide._id ? String(guide._id) : guide.id,
    id: guide.id || (guide._id ? String(guide._id) : undefined),
    section: guide.section || '',
    icon: guide.icon || 'BookOpen',
    isActive: typeof guide.isActive === 'boolean' ? guide.isActive : true,
    viewCount: Number(guide.viewCount) || 0,
  };
};

const ensureGuidesSeeded = async () => {
  const count = await TravelGuide.countDocuments();
  if (count > 0) return;

  const seedGuides = (planYourTripGuides || [])
    .map((guide, index) => ({
      ...normalizeGuidePayload(guide, { autoSlug: true, fallbackOrder: index + 1 }),
      order: Number.isFinite(Number(guide.order)) ? Number(guide.order) : index + 1,
      isActive: true,
      viewCount: 0,
    }))
    .filter((guide) => guide.title && guide.slug && guide.category && guide.content);

  if (seedGuides.length > 0) {
    await TravelGuide.insertMany(seedGuides, { ordered: false });
  }
};

const getCategorySummary = (guides) => {
  const categories = Array.from(new Set(guides.map((guide) => guide.category).filter(Boolean)));
  return categories.map((category) => ({
    name: category,
    count: guides.filter((guide) => guide.category === category).length,
  }));
};

// Public: get active guides
exports.getGuides = async (req, res) => {
  try {
    await ensureGuidesSeeded();
    const guides = await TravelGuide.find({ isActive: true }).sort({ order: 1, title: 1 });
    const formattedGuides = guides.map(guideResponse);
    res.json({ guides: formattedGuides, categories: getCategorySummary(formattedGuides) });
  } catch (err) {
    console.error('getGuides error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

// Admin: get all guides, including inactive
exports.getGuidesAdmin = async (req, res) => {
  try {
    await ensureGuidesSeeded();
    const guides = await TravelGuide.find().sort({ order: 1, title: 1 });
    res.json({ guides: guides.map(guideResponse) });
  } catch (err) {
    console.error('getGuidesAdmin error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

// Public: get active guide by slug
exports.getGuideBySlug = async (req, res) => {
  try {
    await ensureGuidesSeeded();
    const guide = await TravelGuide.findOne({ slug: req.params.slug, isActive: true });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    guide.viewCount = (guide.viewCount || 0) + 1;
    await guide.save();

    res.json({ guide: guideResponse(guide) });
  } catch (err) {
    console.error('getGuideBySlug error:', err);
    res.status(500).json({ message: 'Failed to fetch guide' });
  }
};

// Public: get active guides by category
exports.getGuidesByCategory = async (req, res) => {
  try {
    await ensureGuidesSeeded();
    const { category } = req.params;
    const guides = await TravelGuide.find({ category, isActive: true }).sort({ order: 1, title: 1 });

    if (guides.length === 0) {
      return res.status(404).json({ message: 'No guides found for this category' });
    }

    res.json({ guides: guides.map(guideResponse) });
  } catch (err) {
    console.error('getGuidesByCategory error:', err);
    res.status(500).json({ message: 'Failed to fetch guides by category' });
  }
};

// Admin: create guide
exports.createGuide = async (req, res) => {
  try {
    const data = normalizeGuidePayload(req.body || {}, { autoSlug: true });

    if (!data.title || !data.slug || !data.category || !data.content) {
      return res.status(400).json({ message: 'Title, slug, category, and content are required' });
    }

    const duplicateSlug = await TravelGuide.findOne({ slug: data.slug }).select('_id');
    if (duplicateSlug) {
      return res.status(400).json({ message: 'Guide slug already exists' });
    }

    if (req.user && req.user._id) data.updatedBy = req.user._id;

    const guide = await TravelGuide.create(data);
    res.status(201).json(guideResponse(guide));
  } catch (err) {
    console.error('createGuide error:', err);
    res.status(500).json({ message: 'Failed to create guide' });
  }
};

// Admin: update guide
exports.updateGuide = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid guide ID' });
  }

  try {
    const data = normalizeGuidePayload(req.body || {});

    if (data.slug) {
      const duplicateSlug = await TravelGuide.findOne({ slug: data.slug, _id: { $ne: id } }).select('_id');
      if (duplicateSlug) {
        return res.status(400).json({ message: 'Guide slug already exists' });
      }
    }

    if (req.user && req.user._id) data.updatedBy = req.user._id;

    const guide = await TravelGuide.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    res.json(guideResponse(guide));
  } catch (err) {
    console.error('updateGuide error:', err);
    res.status(500).json({ message: 'Failed to update guide' });
  }
};

// Admin: delete guide
exports.deleteGuide = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid guide ID' });
  }

  try {
    const deletedGuide = await TravelGuide.findByIdAndDelete(id);
    if (!deletedGuide) return res.status(404).json({ message: 'Guide not found' });
    res.json({ message: 'Guide deleted successfully' });
  } catch (err) {
    console.error('deleteGuide error:', err);
    res.status(500).json({ message: 'Failed to delete guide' });
  }
};
