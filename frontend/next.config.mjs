/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
