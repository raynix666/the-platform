import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Required for Netlify SSR deployment (server actions, cookies, DB access)
  // Do NOT add output: 'export' — that disables server features
};

export default nextConfig;
