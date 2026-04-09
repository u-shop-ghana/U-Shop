"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Login Page ─────────────────────────────────────────────────
// Split-screen layout: hero left (desktop), login form right.
// Matches the Figma design from design/web-designs/desktop/Login.html
// Fully functional — email/password + Google OAuth.
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle email/password login via Supabase Auth
  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Map Supabase error messages to user-friendly ones
        if (authError.message.includes("Invalid login credentials")) {
          setError("Incorrect email or password. Please try again.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in. Check your inbox.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Redirect to homepage on success — the middleware will
      // pick up the new session cookies automatically.
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Google OAuth login
  async function handleGoogleLogin() {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (authError) {
      setError("Failed to connect to Google. Please try again.");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* ── Left Side: Hero Section (Desktop only) ────────────── */}
      <div className="hidden lg:flex flex-1 bg-campus-card relative overflow-hidden items-center justify-center p-16">
        {/* Background Image with Overlay — uses the real hero image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero/login.png"
            alt="Students collaborating on laptops"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-campus-dark via-[rgba(127,13,242,0.2)] to-transparent" />
          <div className="absolute inset-0 bg-[rgba(127,13,242,0.1)] mix-blend-multiply" />
        </div>

        {/* Decorative Blurs */}
        <div className="absolute -left-32 -top-52 w-[600px] h-[600px] bg-[rgba(209,37,244,0.2)] rounded-full blur-[60px] opacity-50" />
        <div className="absolute -right-32 -bottom-52 w-[500px] h-[500px] bg-[rgba(147,51,234,0.2)] rounded-full blur-[50px] opacity-50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-8 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-white/90 font-medium">
              #1 Marketplace for Students
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold text-white tracking-tight">
              Buy, Sell, and Upgrade
            </h1>
            <h1 className="text-6xl font-extrabold text-gradient-brand">
              Campus Tech.
            </h1>
          </div>

          {/* Description */}
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            Join thousands of students across Ghana getting the best deals on
            laptops, phones, and accessories. Verified student-to-student trading.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-purple-600 bg-campus-card flex items-center justify-center text-xs text-white/60 font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              <span className="font-bold text-white">2,000+</span> students
              joined this week
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Side: Login Form ────────────────────────────── */}
      <div className="flex-1 bg-campus-dark flex flex-col p-6 md:p-12 relative overflow-y-auto min-h-screen">
        {/* Logo Header */}
        <div className="mb-12 flex justify-center lg:justify-start">
          <Link href="/">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="w-full max-w-md space-y-8">
            {/* Main Card */}
            <div className="bg-campus-card border border-white/5 rounded-2xl shadow-2xl p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter your details to access your account.
                </p>
              </div>

              {/* Login / Sign Up Tabs */}
              <div className="flex gap-1 p-1 bg-black/20 rounded-xl mb-8">
                <button className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg shadow-sm transition-all">
                  Login
                </button>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-400 hover:text-white rounded-lg transition-all text-center"
                >
                  Sign Up
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-status-error/10 border border-status-error/20 rounded-xl">
                  <p className="text-sm text-status-error font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailLogin} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email or Phone
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="material-symbols-outlined text-xl">
                        mail
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-sm"
                      placeholder="student@ug.edu.gh"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <span className="material-symbols-outlined text-xl">
                        lock
                      </span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-sm"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 bg-black/20 border-white/10 rounded text-purple-600 focus:ring-purple-600 focus:ring-offset-campus-card"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-400 cursor-pointer"
                  >
                    Remember my device
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-4 bg-gradient-cta text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Logging in..." : "Log In"}</span>
                  {!loading && (
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs font-medium text-gray-500 bg-campus-card uppercase tracking-widest">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Terms */}
                <p className="text-[11px] text-center text-gray-500 leading-relaxed pt-2">
                  By continuing, you agree to U-Shop&apos;s{" "}
                  <Link
                    href="/terms"
                    className="text-gray-400 underline hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-gray-400 underline hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Footer Link */}
            <p className="text-center text-gray-400 text-sm">
              New to U-Shop?{" "}
              <Link
                href="/register"
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-auto pt-8 flex justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              verified_user
            </span>
            Verified Platform
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              support_agent
            </span>
            24/7 Support
          </div>
        </div>
      </div>
    </div>
  );
}
