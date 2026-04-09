"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Register Page ──────────────────────────────────────────────
// Split-screen: hero left (campus imagery), registration form right.
// Matches design/web-designs/desktop/Signup.html
// Fully functional: Supabase signup → backend /register → auto-verify.
export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [verifyAsStudent, setVerifyAsStudent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);



  // Password strength indicator
  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, label: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    return { level: score, label: labels[score - 1] || "Very Weak" };
  })();

  const strengthColors = ["bg-status-error", "bg-status-warning", "bg-status-info", "bg-status-success"];

  // Known disposable/temporary email domains that cause high bounce rates.
  // These services create throwaway inboxes — emails to them are wasted.
  const DISPOSABLE_DOMAINS = [
    "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
    "yopmail.com", "sharklasers.com", "trashmail.com", "10minutemail.com",
    "temp-mail.org", "fakeinbox.com", "maildrop.cc", "dispostable.com",
    "mailnesia.com", "tempr.email", "getnada.com",
  ];

  // Handle email/password registration
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    // ── Email validation to prevent high bounce rates ──────────
    // Validate format: must match standard email pattern with a real TLD
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., student@ug.edu.gh).");
      return;
    }

    // Block disposable/temporary email services that cause bounces
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
      setError("Temporary email addresses are not allowed. Please use your real email.");
      return;
    }

    // Block obviously fake TLDs (single char or numeric-only)
    const tld = emailDomain?.split(".").pop();
    if (!tld || tld.length < 2 || /^\d+$/.test(tld)) {
      setError("Please enter a valid email address with a real domain.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the Supabase auth user.
      // We store the verifyAsStudent preference in user_metadata so the
      // callback route can read it after email confirmation and redirect
      // the user to /verify if they opted in.
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            wants_student_verification: verifyAsStudent,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("An account with this email already exists. Try logging in.");
        } else {
          setError(authError.message);
        }
        return;
      }

      // Step 2: Create our internal User record via the Express API.
      // This syncs Supabase with our database and triggers auto-verification
      // for student emails. We pass the JWT so the API can verify the user.
      if (data.session) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({ email, fullName }),
        });

        if (!res.ok) {
          // Non-critical: user is created in Supabase, the /sync endpoint
          // will handle this on next login. Log but don't block signup.
          console.warn("Backend sync failed, will retry on next login");
        }
      }

      // Step 3: Redirect based on whether email confirmation is required
      if (data.user?.identities?.length === 0) {
        setError("An account with this email already exists.");
        return;
      }

      // If Supabase requires email confirmation, show the "check your email" page.
      // The actual student verification redirect happens in /callback after
      // the user clicks the confirmation link.
      if (!data.session) {
        router.push(
          `/verify?email=${encodeURIComponent(email)}&type=email_confirmation`
        );
      } else {
        // Session exists immediately (email confirmation disabled in Supabase).
        // Route based on student verification preference.
        if (verifyAsStudent) {
          router.push("/verify?type=student");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Google OAuth signup
  async function handleGoogleSignup() {
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
    <main className="flex flex-col md:flex-row flex-grow min-h-screen">
      {/* ── Left: Student Hero Banner ─────────────────────────── */}
      <section className="relative w-full md:w-1/2 bg-ushop-purple overflow-hidden hidden md:flex items-center justify-center p-8 md:p-16">
        {/* Background Image with Overlay — real Ghanaian students photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero/signup.png"
            alt="Ghanaian students studying together"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ushop-purple/80 via-ushop-purple/40 to-ushop-pink/60" />
        </div>

        <div className="relative z-10 text-white max-w-lg">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={160}
              height={48}
              className="h-12 w-auto object-contain mb-12"
              priority
            />
          </Link>

          {/* Student Exclusive Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
            <span className="material-symbols-outlined text-sm">school</span>
            <span className="text-xs font-bold tracking-widest uppercase">
              Student Exclusive
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Empowering{" "}
            <span className="text-ushop-pink">Ghanaian Students</span> with
            Affordable Tech.
          </h1>

          {/* Description */}
          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Join thousands of students from UG, KNUST, and UCC getting the best
            deals on laptops, smartphones, and essentials.
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-ushop-pink">
                verified
              </span>
              <div>
                <p className="font-bold text-sm">Verified Sellers</p>
                <p className="text-xs text-white/60">Shop with confidence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-ushop-pink">
                local_shipping
              </span>
              <div>
                <p className="font-bold text-sm">Campus Delivery</p>
                <p className="text-xs text-white/60">
                  Straight to your hostel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right: Registration Form ─────────────────────────── */}
      <section className="w-full md:w-1/2 bg-campus-form-bg flex items-center justify-center p-6 md:p-12">
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
                priority
              />
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-400">Join the U-Shop community today.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-sm text-status-error font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">
                  person
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-campus-input border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-ushop-purple focus:border-ushop-purple outline-none transition-all placeholder:text-gray-600"
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">
                  alternate_email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-campus-input border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-ushop-purple focus:border-ushop-purple outline-none transition-all placeholder:text-gray-600"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-campus-input border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-ushop-purple focus:border-ushop-purple outline-none transition-all placeholder:text-gray-600"
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength.level
                            ? strengthColors[passwordStrength.level - 1]
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Verify as Student Toggle */}
            <div className="flex items-center justify-between p-4 bg-ushop-purple/10 border border-ushop-purple/30 rounded-xl">
              <div className="flex gap-3 items-center">
                <span className="material-symbols-outlined text-ushop-purple">
                  school
                </span>
                <div>
                  <p className="text-sm font-bold text-white">
                    Verify as Student
                  </p>
                  <p className="text-xs text-gray-400">
                    Unlock student-only prices
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifyAsStudent}
                  onChange={(e) => setVerifyAsStudent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ushop-purple" />
              </label>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-ushop-purple bg-campus-input border-gray-700 rounded focus:ring-ushop-purple"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-400 leading-tight"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-ushop-pink hover:underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-ushop-pink hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                of U-Shop Ghana.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreeTerms}
              className="w-full bg-gradient-brand text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-ushop-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-4">
              <div className="flex-grow h-px bg-gray-800" />
              <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                OR
              </span>
              <div className="flex-grow h-px bg-gray-800" />
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full bg-transparent border border-gray-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.68 14.91 1 12 1 7.48 1 3.65 3.59 1.81 7.39l3.7 2.87C6.38 7.47 9 5 12 5z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.88c2.16-1.99 3.42-4.93 3.42-8.7z"
                  fill="#4285F4"
                />
                <path
                  d="M5.51 14.74c-.28-.85-.44-1.76-.44-2.74 0-.98.16-1.89.44-2.74L1.81 7.39C.66 9.77 0 12.39 0 15.22c0 2.83.66 5.45 1.81 7.83l3.7-2.87c-.28-.85-.44-1.76-.44-2.74z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 23c3.12 0 5.73-1.03 7.64-2.8l-3.7-2.88c-1.05.7-2.39 1.12-3.94 1.12-3 0-5.53-2.03-6.44-4.76l-3.7 2.87C3.65 20.41 7.48 23 12 23z"
                  fill="#34A853"
                />
              </svg>
              Sign up with Google
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-ushop-pink font-bold hover:underline transition-all"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
