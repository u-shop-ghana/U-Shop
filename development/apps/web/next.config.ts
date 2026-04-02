import type { NextConfig } from "next";

// ─── Next.js Configuration ──────────────────────────────────────
// The @ushop/shared package uses "moduleResolution": "NodeNext" which
// requires .js extensions in TypeScript imports (e.g., './constants.js').
// Turbopack needs the resolveExtensions config to properly map those
// .js references back to the actual .ts source files.
const nextConfig: NextConfig = {
  transpilePackages: ["@ushop/shared"],
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
};

export default nextConfig;
