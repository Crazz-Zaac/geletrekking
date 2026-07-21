/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

export default nextConfig;
