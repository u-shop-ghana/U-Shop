import type { NextConfig } from "next";

// ─── Next.js Configuration ──────────────────────────────────────
// The @ushop/shared package uses "moduleResolution": "NodeNext" which
// requires .js extensions in TypeScript imports (e.g., './constants.js').
// Turbopack needs the resolveExtensions config to properly map.

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"]
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx']
    };
    return config;
  }
};

export default nextConfig;
