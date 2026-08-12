import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client', 'pg', '@prisma/adapter-pg'],
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // No SENTRY_AUTH_TOKEN yet (no Sentry account) — skip source map upload
  // rather than fail the build.
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
});

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