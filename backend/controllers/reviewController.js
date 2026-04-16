const normalizeGoogleReview = (review, index) => ({
  id: `google-${index}`,
  authorName: review.author_name || 'Google User',
  authorPhoto: review.profile_photo_url || '',
  rating: Number(review.rating) || 5,
  text: review.text || '',
  relativeTime: review.relative_time_description || '',
  time: review.time || null,
  source: 'google',
})

exports.getGoogleReviews = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || ''
    const placeId = process.env.GOOGLE_PLACE_ID || ''

    if (!apiKey || !placeId) {
      return res.json({
        place: null,
        rating: null,
        totalRatings: null,
        reviews: [],
        configured: false,
      })
    }

    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,rating,user_ratings_total,reviews,url',
      key: apiKey,
    })

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Google Places request failed: ${response.status}`)
    }

    const payload = await response.json()

    if (payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${payload.status}`)
    }

    const result = payload.result || {}
    const reviews = Array.isArray(result.reviews)
      ? result.reviews.slice(0, 6).map(normalizeGoogleReview)
      : []

    res.json({
      place: result.name || null,
      rating: result.rating || null,
      totalRatings: result.user_ratings_total || null,
      url: result.url || null,
      reviews,
      configured: true,
    })
  } catch (err) {
    console.error('getGoogleReviews error:', err)
    res.status(500).json({
      message: 'Failed to fetch Google reviews',
      reviews: [],
      configured: true,
    })
  }
}
