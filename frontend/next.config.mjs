/** @type {import('next').NextConfig} */
const nextConfig = {
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
