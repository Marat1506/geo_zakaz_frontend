/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiTarget =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lotfood.ru',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lotfood.ru',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
