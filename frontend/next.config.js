/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig
