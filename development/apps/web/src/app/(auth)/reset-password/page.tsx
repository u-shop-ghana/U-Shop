"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Reset Password Page ────────────────────────────────────────
// Users arrive here from the password reset email link.
// Matches design/web-designs/desktop/Reset password.html
// Updates the password via Supabase Auth updateUser().
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password requirement checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperAndNumber = /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasMinLength) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Password updated successfully — redirect to login
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ── Left Side: Hero Section ───────────────────────────── */}
      <section className="relative hidden md:flex md:w-1/2 bg-campus-dark overflow-hidden items-center justify-center p-12">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ushop-pink rounded-full filter blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ushop-purple rounded-full filter blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-lg space-y-6 text-left">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-ushop-red flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">
              shop
            </span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
            Secure Your Account
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Enter a new password to regain access to your U-Shop student
            account.
          </p>
          <div className="pt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="material-symbols-outlined text-ushop-pink">
                verified_user
              </span>
              <span className="text-sm">End-to-end encrypted security</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400">
              <span className="material-symbols-outlined text-ushop-pink">
                school
              </span>
              <span className="text-sm">
                Exclusively for Ghanaian University students
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Side: Form ──────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-campus-form-bg">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <Link href="/" className="flex items-center gap-1">
            <div className="w-10 h-10 bg-ushop-red flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">
              shop
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Reset Password
            </h2>
            <p className="mt-2 text-neutral-400">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-sm text-status-error font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-neutral-300"
              >
                New Password
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-500 group-focus-within:text-ushop-pink transition-colors">
                  lock
                </span>
                <input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-campus-input border border-neutral-800 text-white pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-ushop-pink focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-neutral-300"
              >
                Confirm New Password
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-500 group-focus-within:text-ushop-pink transition-colors">
                  lock_reset
                </span>
                <input
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-campus-input border border-neutral-800 text-white pl-10 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-ushop-pink focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-campus-input/50 p-4 rounded-xl border border-neutral-800 space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Security requirements:
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      hasMinLength ? "text-status-success" : "text-neutral-600"
                    }`}
                  >
                    {hasMinLength ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      hasUpperAndNumber
                        ? "text-status-success"
                        : "text-neutral-600"
                    }`}
                  >
                    {hasUpperAndNumber
                      ? "check_circle"
                      : "radio_button_unchecked"}
                  </span>
                  One uppercase letter & one number
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      passwordsMatch
                        ? "text-status-success"
                        : "text-neutral-600"
                    }`}
                  >
                    {passwordsMatch
                      ? "check_circle"
                      : "radio_button_unchecked"}
                  </span>
                  Passwords match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !hasMinLength || !passwordsMatch}
              className="w-full bg-gradient-brand text-white font-bold py-4 rounded-xl shadow-lg shadow-ushop-purple/20 hover:shadow-ushop-pink/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Password
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Back to Login */}
          <div className="pt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-ushop-pink transition-colors group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back to Login
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-12 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
            <p>© 2026 U-Shop. Empowering Ghanaian students.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
