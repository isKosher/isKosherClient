import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["www.google.com", "www.allrecipes.com", "images.squarespace-cdn.com", "cdn.britannica.com","example.com"],
    remotePatterns:[
      {
        protocol: "https",
        hostname: "**",
      },
    ]
  },
};

export default nextConfig;
