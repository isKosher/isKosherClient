import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    domains: [
      "www.google.com",
      "www.drive.google.com",
      "www.allrecipes.com",
      "images.squarespace-cdn.com",
      "cdn.britannica.com",
      "example.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
