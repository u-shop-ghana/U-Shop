"use client";
import Link from 'next/link';

// ─── Marketplace Error Boundary ─────────────────────────────────
// Next.js App Router error boundary. Catches any runtime errors in
// marketplace pages and shows a user-friendly retry UI instead of
// a full white-screen crash. Resets the component tree on retry.
//
// This is placed at the (marketplace) route group level so all
// pages inside (homepage, search, listings, stores, etc.) are
// protected. Auth pages have their own error handling.
export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-red-400">
            error_outline
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 mb-2 text-sm">
          We hit an unexpected error loading this page. This is usually
          temporary — please try again.
        </p>

        {/* Show error digest in development for debugging */}
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-ushop-purple text-white font-bold rounded-xl hover:bg-ushop-purple/90 transition-colors text-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
