/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Suppress hydration warnings in development
  reactStrictMode: true,
  // Disable React DevTools warning in development
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
};

module.exports = nextConfig;
