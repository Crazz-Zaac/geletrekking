const { planYourTripGuides } = require('../data/plan-your-trip-data');

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Format guide for API response
 */
const formatGuide = (guide) => ({
  _id: guide.id,
  ...guide,
  isActive: true,
  viewCount: 0,
});

/**
 * Get all guides from static data with categories
 */
exports.getGuides = async (req, res) => {
  try {
    const guides = planYourTripGuides.map(formatGuide);
    const categories = Array.from(new Set(guides.map((g) => g.category)));
    res.json({
      guides,
      categories: categories.map((cat) => ({
        name: cat,
        count: guides.filter((g) => g.category === cat).length,
      })),
    });
  } catch (err) {
    console.error('getGuides error:', err);
    res.status(500).json({ message: 'Failed to fetch guides' });
  }
};

/**
 * Get guide by slug from static data
 * Individual guides are served from hardcoded data, not database
 */
exports.getGuideBySlug = async (req, res) => {
  try {
    const guide = planYourTripGuides.find((g) => g.slug === req.params.slug);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    res.json({ guide: formatGuide(guide) });
  } catch (err) {
    console.error('getGuideBySlug error:', err);
    res.status(500).json({ message: 'Failed to fetch guide' });
  }
};

/**
 * Get guides by category from static data
 */
exports.getGuidesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const guides = planYourTripGuides.filter((g) => g.category === category).map(formatGuide);

    if (guides.length === 0) {
      return res.status(404).json({ message: 'No guides found for this category' });
    }

    res.json({ guides });
  } catch (err) {
    console.error('getGuidesByCategory error:', err);
    res.status(500).json({ message: 'Failed to fetch guides by category' });
  }
};
