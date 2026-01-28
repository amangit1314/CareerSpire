const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for now
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  serverExternalPackages: [],
};

export default nextConfig;

// // next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   // Remove deprecated options
//   // swcMinify: true, // Deprecated - now default

//   images: {
//     // Replace domains with remotePatterns
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '**', // Allow all domains for now
//       },
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//       },
//     ],
//   },

//   // Move serverComponentsExternalPackages outside experimental
//   serverExternalPackages: [],

//   // Disable Turbopack for builds (important for Vercel)
//   webpack: (config, { isServer, dev }) => {
//     // If you need to customize webpack, do it here
//     return config;
//   },
// };

// export default nextConfig;