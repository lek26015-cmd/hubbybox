import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'profile.line-scdn.net' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'admin.lvh.me', 
        'landing.lvh.me', 
        'app.localhost:3000', 
        'localhost:3000',
        'hubbybox.app',
        'app.hubbybox.app',
        'admin.hubbybox.app'
      ]
    }
  },
  // Supporting subdomains for Hot Module Replacement
  allowedDevOrigins: [
    'admin.lvh.me', 
    'landing.lvh.me', 
    'app.localhost:3000', 
    'localhost:3000',
    'hubbybox.app',
    'app.hubbybox.app',
    'admin.hubbybox.app'
  ],
};

export default nextConfig;
