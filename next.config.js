// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//       },
//     ],
//   },
// };

// export default nextConfig;

// next.config.js - ES Module syntax
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'vercel.app', 'your-production-domain.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://mocky-nine.vercel.app'
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  // Remove the experimental if not needed or update syntax
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

// If you're using next-pwa
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Other PWA options...
});

// Export the config
export default pwaConfig ? pwaConfig(nextConfig) : nextConfig;

// import withPWA from 'next-pwa';

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   images: {
//     domains: ['localhost', 'vercel.app'],
//   },
// };

// const pwaConfig = withPWA({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   // other PWA options
// });

// export default pwaConfig(nextConfig);