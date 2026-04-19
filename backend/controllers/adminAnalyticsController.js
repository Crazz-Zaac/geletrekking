const ContactMessage = require('../models/ContactMessage')
const TrekPackage = require('../models/TrekPackage')
const BlogPost = require('../models/BlogPost')
const GalleryItem = require('../models/GalleryItem')
const Activity = require('../models/Activity')
const Testimonial = require('../models/Testimonial')
const TravelGuide = require('../models/TravelGuide')

const DAY_IN_MS = 24 * 60 * 60 * 1000

const toUtcDayKey = (date) => {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  return utc.toISOString().slice(0, 10)
}

const toSignedPercentage = (current, previous) => {
  if (!previous) {
    if (!current) return '0.0%'
    return '+100.0%'
  }

  const delta = ((current - previous) / previous) * 100
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`
}

const sumMapValues = (map) => {
  let total = 0
  map.forEach((value) => {
    total += value
  })
  return total
}

const getGroupedCountsByDate = async (model, matchQuery = {}) => {
  const groups = await model.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: 'UTC',
          },
        },
        count: { $sum: 1 },
      },
    },
  ])

  return new Map(groups.map((item) => [item._id, item.count]))
}

exports.getAdminAnalytics = async (req, res) => {
  try {
    const now = new Date()
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

    const startLast7 = new Date(todayUtc.getTime() - 6 * DAY_IN_MS)
    const startPrev7 = new Date(todayUtc.getTime() - 13 * DAY_IN_MS)

    const [
      totalInquiries,
      unreadMessages,
      treksCount,
      blogsCount,
      activitiesCount,
      galleryCount,
      guidesCount,
      testimonialsCount,
      guideViewsStats,
      inquiryDailyAll,
      inquiryDailyLast7,
      inquiryDailyPrev7,
      trekDailyLast7,
      trekDailyPrev7,
      blogDailyLast7,
      blogDailyPrev7,
      galleryDailyLast7,
      galleryDailyPrev7,
      guideDailyLast7,
      guideDailyPrev7,
      regionGroups,
    ] = await Promise.all([
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ isRead: false }),
      TrekPackage.countDocuments(),
      BlogPost.countDocuments(),
      Activity.countDocuments(),
      GalleryItem.countDocuments(),
      TravelGuide.countDocuments(),
      Testimonial.countDocuments(),
      TravelGuide.aggregate([
        {
          $group: {
            _id: null,
            totalGuideViews: { $sum: { $ifNull: ['$viewCount', 0] } },
            avgGuideViews: { $avg: { $ifNull: ['$viewCount', 0] } },
          },
        },
      ]),
      getGroupedCountsByDate(ContactMessage),
      getGroupedCountsByDate(ContactMessage, { createdAt: { $gte: startLast7 } }),
      getGroupedCountsByDate(ContactMessage, { createdAt: { $gte: startPrev7, $lt: startLast7 } }),
      getGroupedCountsByDate(TrekPackage, { createdAt: { $gte: startLast7 } }),
      getGroupedCountsByDate(TrekPackage, { createdAt: { $gte: startPrev7, $lt: startLast7 } }),
      getGroupedCountsByDate(BlogPost, { createdAt: { $gte: startLast7 } }),
      getGroupedCountsByDate(BlogPost, { createdAt: { $gte: startPrev7, $lt: startLast7 } }),
      getGroupedCountsByDate(GalleryItem, { createdAt: { $gte: startLast7 } }),
      getGroupedCountsByDate(GalleryItem, { createdAt: { $gte: startPrev7, $lt: startLast7 } }),
      getGroupedCountsByDate(TravelGuide, { createdAt: { $gte: startLast7 } }),
      getGroupedCountsByDate(TravelGuide, { createdAt: { $gte: startPrev7, $lt: startLast7 } }),
      TrekPackage.aggregate([
        {
          $group: {
            _id: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$region', null] },
                    { $eq: [{ $trim: { input: { $ifNull: ['$region', ''] } } }, ''] },
                  ],
                },
                'Unspecified',
                '$region',
              ],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ])

    const guideViewSummary = guideViewsStats[0] || { totalGuideViews: 0, avgGuideViews: 0 }

    const contentItems = treksCount + blogsCount + activitiesCount + galleryCount + guidesCount + testimonialsCount

    const contentLast7Map = new Map()
    const contentPrev7Map = new Map()

    ;[trekDailyLast7, blogDailyLast7, galleryDailyLast7, guideDailyLast7].forEach((map) => {
      map.forEach((count, key) => {
        contentLast7Map.set(key, (contentLast7Map.get(key) || 0) + count)
      })
    })

    ;[trekDailyPrev7, blogDailyPrev7, galleryDailyPrev7, guideDailyPrev7].forEach((map) => {
      map.forEach((count, key) => {
        contentPrev7Map.set(key, (contentPrev7Map.get(key) || 0) + count)
      })
    })

    const trends = []
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(startLast7.getTime() + index * DAY_IN_MS)
      const key = toUtcDayKey(day)
      trends.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short' }),
        inquiries: inquiryDailyAll.get(key) || 0,
        contentUpdates: contentLast7Map.get(key) || 0,
      })
    }

    const topRegions = regionGroups.slice(0, 5).map((item) => ({
      name: item._id,
      count: item.count,
    }))
    const otherRegionsCount = regionGroups.slice(5).reduce((sum, item) => sum + item.count, 0)
    const regions = otherRegionsCount > 0 ? [...topRegions, { name: 'Others', count: otherRegionsCount }] : topRegions

    const contentMixRaw = [
      { name: 'Treks', count: treksCount },
      { name: 'Blogs', count: blogsCount },
      { name: 'Activities', count: activitiesCount },
      { name: 'Gallery', count: galleryCount },
      { name: 'Guides', count: guidesCount },
      { name: 'Testimonials', count: testimonialsCount },
    ].filter((entry) => entry.count > 0)

    const contentMix = contentMixRaw.map((entry) => ({
      name: entry.name,
      value: contentItems > 0 ? Number(((entry.count / contentItems) * 100).toFixed(1)) : 0,
    }))

    const inquiriesLast7 = sumMapValues(inquiryDailyLast7)
    const inquiriesPrev7 = sumMapValues(inquiryDailyPrev7)
    const contentLast7 = sumMapValues(contentLast7Map)
    const contentPrev7 = sumMapValues(contentPrev7Map)
    const unreadRate = totalInquiries > 0 ? (unreadMessages / totalInquiries) * 100 : 0

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      metrics: {
        totalInquiries,
        inquiriesChangePct: toSignedPercentage(inquiriesLast7, inquiriesPrev7),
        contentItems,
        contentChangePct: toSignedPercentage(contentLast7, contentPrev7),
        avgGuideViews: Math.round(guideViewSummary.avgGuideViews || 0),
        totalGuideViews: guideViewSummary.totalGuideViews || 0,
        unreadRate: Number(unreadRate.toFixed(1)),
        unreadMessages,
      },
      trends,
      regions,
      contentMix,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return res.status(500).json({ message: 'Failed to generate analytics' })
  }
}
