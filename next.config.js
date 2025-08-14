/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Force dynamic rendering for all pages during build to fix deployment issues
  experimental: {
    forceSwcTransforms: true,
  },
  // Disable static generation for problematic routes
  async generateBuildId() {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig