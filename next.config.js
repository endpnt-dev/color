/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'colord',
      '@bjornlu/colorblind'
    ]
  },
  images: {
    domains: []
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-side dependencies on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'colord': false,
        '@bjornlu/colorblind': false,
        fs: false,
        path: false,
      }
    }
    return config
  }
}

module.exports = nextConfig