import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ['admin.lvh.me', 'landing.lvh.me', 'app.localhost:3000', 'localhost:3000']
    }
  },
  // Supporting subdomains for Hot Module Replacement
  allowedDevOrigins: ['admin.lvh.me', 'landing.lvh.me', 'app.localhost:3000', 'localhost:3000'],
};

export default nextConfig;
