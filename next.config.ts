import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from your local Strapi instance
    remotePatterns: [
      {
        protocol: 'http', // Protocol used by local Strapi
        hostname: 'localhost',
        port: '1337', // Port used by local Strapi
        pathname: '/uploads/**', // Allow any path under /uploads
      },
      // Add other domains here if you fetch images from other sources
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      // },
    ],
  },
};

export default nextConfig;
