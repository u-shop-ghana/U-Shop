"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ─── Forgot Password Page ───────────────────────────────────────
// Split-screen: hero left, email form right.
// Matches design/web-designs/desktop/Forgot password.html
// Sends a password reset email via Supabase Auth.
export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      // Always show success even if email doesn't exist (security best practice)
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left Side: Hero Section ───────────────────────────── */}
      <section className="relative w-full md:w-1/2 flex items-center justify-center overflow-hidden bg-campus-form-bg p-8 md:p-16 hidden md:flex">
        {/* Background Image with Overlay — illustrated students scene */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero/forgot password.png"
            alt="Students studying together"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ushop-purple/80 via-campus-form-bg/90 to-campus-form-bg" />
        </div>

        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ushop-pink rounded-full filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ushop-purple rounded-full filter blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-lg w-full">
          {/* Logo */}
          <Link href="/" className="mb-12 inline-block">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="space-y-6">
            <span className="inline-flex items-center px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-semibold tracking-wider uppercase">
              #1 Marketplace for Students
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Restore Your Access
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Don&apos;t let a forgotten password stop your hustle. Get back into your
              account and continue shopping the best campus deals.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 flex gap-8">
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl">50k+</span>
              <span className="text-gray-500 text-xs">Active Students</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl">20+</span>
              <span className="text-gray-500 text-xs">Universities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Side: Form Section ──────────────────────────── */}
      <section className="w-full md:w-1/2 flex items-center justify-center bg-dark-mesh px-6 py-12 md:px-16 lg:px-24">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center">
            <Link href="/">
              <Image
                src="/assets/logos/web/logo-300w.png"
                alt="U-Shop"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Forgot Password
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-sm text-status-error font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="p-6 bg-status-success/10 border border-status-success/20 rounded-lg text-center">
                <span className="material-symbols-outlined text-status-success text-4xl mb-3 block">
                  mark_email_read
                </span>
                <h3 className="text-lg font-bold text-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-400">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="text-white font-medium">{email}</span>.
                  Check your inbox and follow the instructions.
                </p>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-ushop-pink hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-ushop-pink transition-colors">
                    <span className="material-symbols-outlined text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kwame.campus@gmail.com"
                    required
                    autoComplete="email"
                    className="block w-full pl-11 pr-4 py-3 bg-campus-input/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ushop-pink focus:border-transparent transition-all rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-brand text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-ushop-pink/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {loading ? "Sending..." : "Send Reset Link"}
                </span>
                {!loading && (
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Navigation Links */}
          <div className="pt-6 border-t border-gray-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back to Login
            </Link>
          </div>

          {/* Help Note */}
          <div className="mt-12 p-4 bg-campus-input/30 border border-gray-800 rounded-xl">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-status-info">
                help_outline
              </span>
              <div>
                <p className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Need Help?
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  If you no longer have access to your campus email, please
                  contact our support team at{" "}
                  <span className="text-status-info">support@ushop.gh</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
