/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'pub-1bba152a6fe4451b8d45d1e11980038c.r2.dev' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
};

module.exports = nextConfig;
