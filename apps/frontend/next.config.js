/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react']
  }
}

module.exports = nextConfig 