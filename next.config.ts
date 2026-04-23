/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // increase as needed
    },
  },
}

module.exports = nextConfig;