/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/destination",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/trekking-packages-destinations",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/trekking-packages-destinations/annapurna-circuit",
        destination: "/trek/annapurna-circuit",
        permanent: true,
      },
      {
        source: "/trekking-packages-destinations/sagarmatha-everest-base-camp",
        destination: "/trek/everest-base-camp",
        permanent: true,
      },
      {
        source: "/trekking-packages-destinations/manaslu",
        destination: "/trek/manaslu-circuit",
        permanent: true,
      },
      {
        source: "/optional-activities/langtang-trek",
        destination: "/trek/langtang-valley",
        permanent: true,
      },
      {
        source: "/optional-activities",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/what-pack-is-in-your-bag-check-the-equipment-list",
        destination: "/guides/gear-and-equipment",
        permanent: true,
      },
      {
        source: "/recommended-seasons-for-trekking-in-nepal",
        destination: "/guides/weather-and-seasons",
        permanent: true,
      },
      {
        source: "/search/:path*",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/comments/feed",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/feed",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Annapurna-Circuit.pdf",
        destination: "/trek/annapurna-circuit",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Tsum-Valley-and-Manaslu-Trek.pdf",
        destination: "/trek/manaslu-circuit",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Annapurna-Base-Camp.pdf",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Langtang-Trek-.pdf",
        destination: "/trek/langtang-valley",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Peake-Peak-Trekking.pdf",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Sagarmatha-Base-Camp.pdf",
        destination: "/trek/everest-base-camp",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/02/Island-Peak.pdf",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/trekking-packages-destinations/island-park",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/optional-activities/peake-peak-trek",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/optional-activities/valley-rim-trek",
        destination: "/activities",
        permanent: true,
      },
      {
        source: "/manaslu-and-tsum-valley",
        destination: "/trek/manaslu-circuit",
        permanent: true,
      },
      {
        source: "/trek/:id(\\d+)",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/testimonials",
        destination: "/about#testimonials",
        permanent: true,
      },
      {
        source: "/testimonial/:slug",
        destination: "/about#testimonials",
        permanent: true,
      },
      {
        source: "/trip-search-result",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/wp-travel-engine-cart",
        destination: "/book",
        permanent: true,
      },
      {
        source: "/wp-travel-engine-checkout",
        destination: "/book",
        permanent: true,
      },
      {
        source: "/wishlist",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/author/:slug",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || "").replace(/\/+$/, "");
    const routes = [
      {
        source: "/terms-and-conditions",
        destination: "/terms",
      },
    ];

    if (!apiUrl) {
      return routes;
    }

    return [
      ...routes,
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/private-booking/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ]
  },
  reactStrictMode: true,
  experimental: {
    // Keep middleware.ts working (not using proxy yet)
    // Remove this when fully migrated to proxy pattern
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'geletrekking.s3.eu-central-003.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: '**.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
