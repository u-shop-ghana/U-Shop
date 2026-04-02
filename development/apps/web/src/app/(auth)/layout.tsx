import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "noindex, nofollow", // Auth pages should not be indexed
};

// ─── Auth Layout ────────────────────────────────────────────────
// A clean layout without marketplace navigation. All auth pages
// share this split-screen structure: hero left, form right.
// On mobile, only the form side shows (hero is hidden with lg:flex).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-campus-dark">
      {children}
    </div>
  );
}
