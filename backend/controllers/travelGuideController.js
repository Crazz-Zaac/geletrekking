const TravelGuide = require('../models/TravelGuide');

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

exports.getAllGuides = async (req, res) => {
  try {
    const guides = await TravelGuide.find({ isActive: true }).sort({ category: 1, order: 1, title: 1 }).exec();
    const categories = Array.from(new Set(guides.map((guide) => guide.category))).map((name) => ({
      name,
      count: guides.filter((guide) => guide.category === name).length,
    }));

    res.json({ guides, categories });
  } catch (err) {
    console.error('getAllGuides error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

exports.getGuideBySlug = async (req, res) => {
  try {
    const guide = await TravelGuide.findOne({ slug: req.params.slug, isActive: true }).exec();
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    guide.viewCount += 1;
    await guide.save();

    res.json({ guide });
  } catch (err) {
    console.error('getGuideBySlug error:', err);
    res.status(500).json({ message: 'Failed to fetch guide' });
  }
};

exports.getGuidesByCategory = async (req, res) => {
  try {
    const guides = await TravelGuide.find({
      category: req.params.category,
      isActive: true,
    })
      .sort({ order: 1, title: 1 })
      .exec();

    res.json({ guides });
  } catch (err) {
    console.error('getGuidesByCategory error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

exports.createGuide = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug && payload.title) payload.slug = slugify(payload.title);
    if (!payload.title || !payload.slug || !payload.category || !payload.content) {
      return res.status(400).json({ message: 'title, slug, category, content are required' });
    }

    const exists = await TravelGuide.findOne({ slug: payload.slug }).select('_id');
    if (exists) return res.status(400).json({ message: 'Guide slug already exists' });

    const guide = await TravelGuide.create({ ...payload, updatedBy: req.user?._id });
    res.status(201).json(guide);
  } catch (err) {
    console.error('createGuide error:', err);
    res.status(500).json({ message: 'Failed to create guide' });
  }
};

exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.slug) {
      const dup = await TravelGuide.findOne({ slug: payload.slug, _id: { $ne: id } }).select('_id');
      if (dup) return res.status(400).json({ message: 'Guide slug already exists' });
    }

    const guide = await TravelGuide.findByIdAndUpdate(
      id,
      { ...payload, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    res.json(guide);
  } catch (err) {
    console.error('updateGuide error:', err);
    res.status(500).json({ message: 'Failed to update guide' });
  }
};

exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const guide = await TravelGuide.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    res.json({ message: 'Guide deleted' });
  } catch (err) {
    console.error('deleteGuide error:', err);
    res.status(500).json({ message: 'Failed to delete guide' });
  }
};
