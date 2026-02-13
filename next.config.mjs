/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Experimental optimizations for faster dev & build
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Faster builds
  typescript: {
    // Type checking in a separate process
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;
