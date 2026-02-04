import type { NextConfig } from "next";
import dns from "dns";

// Set Google DNS as early as possible to fix MongoDB SRV resolution issues
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore errors
}

const nextConfig: NextConfig = {
  /* config options here */

  // Allow Cloudinary and Google profile images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Increase timeout for slower connections
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [{
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com; font-src 'self' data:; frame-src 'self' https://www.google.com;",
      }]
    }];
  },
};

export default nextConfig;
