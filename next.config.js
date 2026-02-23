/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Terser error with HeartbeatWorker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: "worker-loader" },
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Disable SWC minifier to avoid Terser issues
  swcMinify: false,
  // Use Terser with proper configuration
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
