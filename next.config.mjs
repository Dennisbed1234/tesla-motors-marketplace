/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.tesla.com' },
      { protocol: 'https', hostname: 'digitalassets.tesla.com' },
    ],
  },
};

export default nextConfig;
