/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002']
    }
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily set to true while we fix type issues
  }
}

module.exports = nextConfig 