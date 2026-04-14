import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

// ─── Next.js Configuration ──────────────────────────────────────
// The @ushop/shared package uses "moduleResolution": "NodeNext" which
// requires .js extensions in TypeScript imports (e.g., './constants.js').
// Turbopack needs the resolveExtensions config to properly map.

const nextConfig: NextConfig = {
  transpilePackages: ["@ushop/shared"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sghnfxwkyrxqciogtodq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow Google public images used in seed data too
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "ushop-uy",

  project: "sentry-ushop",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});
