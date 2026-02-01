/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Fix for Genkit / OpenTelemetry critical dependency warnings
  serverExternalPackages: [
    '@opentelemetry/instrumentation',
    'require-in-the-middle'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      }
    ],
  },
};

module.exports = nextConfig;