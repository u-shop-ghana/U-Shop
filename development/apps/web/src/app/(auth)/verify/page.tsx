"use client";

import { useState, useEffect, useRef, Suspense, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { STUDENT_EMAIL_DOMAINS } from "@/lib/student-domains";
import { apiFetch } from "@/lib/api-client";
import { uploadFileToSupabase } from "@/lib/supabase/storage";

// ─── Verify Page Wrapper ────────────────────────────────────────
// useSearchParams() requires a Suspense boundary at the page level
// for Next.js static generation. Without this, the build fails
// because Next.js can't prerender a page that reads URL search params.
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-campus-form-bg">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-ushop-purple/30 rounded-full" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}

// ─── Student Verification Page ──────────────────────────────────
// Two paths:
//   1. Auto-verification: If user registered with .edu.gh email,
//      they see a success state and can proceed immediately.
//   2. Manual verification: University selection + student ID upload.
// Matches design/web-designs/desktop/Student verification.html
function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const emailParam = searchParams.get("email") || "";

  // Check if the email from the URL param is a student email
  const isAutoVerified = (() => {
    const domain = emailParam.split("@")[1]?.toLowerCase();
    if (!domain) return false;
    return STUDENT_EMAIL_DOMAINS.some(
      (d: string) => domain === d || domain.endsWith("." + d)
    );
  })();

  // State for verification form (manual path)
  const [university, setUniversity] = useState("");
  const [studentEmail, setStudentEmail] = useState(emailParam);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // ── University data from the API ──────────────────────────────
  // Fetched from GET /api/v1/universities on mount instead of hardcoding.
  // This ensures the dropdown always matches the DB (admins can add/remove
  // universities without a code deploy).
  interface UniversityOption {
    id: string;
    name: string;
    shortName: string;
    slug: string;
    domain: string | null;
    logoUrl: string | null;
  }
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);

  useEffect(() => {
    // Fetch the list of active universities from our Express API.
    // We don't need auth for this — it's a public endpoint.
    // The client-side apiFetch returns the raw JSON from the API,
    // which is { success: true, data: UniversityOption[] }.
    apiFetch("/api/v1/universities")
      .then((response: { success?: boolean; data?: UniversityOption[] }) => {
        // Handle both { success, data } and direct array responses
        if (response.success && Array.isArray(response.data)) {
          setUniversities(response.data);
        } else if (Array.isArray(response)) {
          // Fallback: in case the API shape changes
          setUniversities(response as unknown as UniversityOption[]);
        }
      })
      .catch(() => {
        // API down — the user will see "No universities available"
        // in the dropdown, which is better than crashing.
      })
      .finally(() => setUniversitiesLoading(false));
  }, []);

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 5MB)
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setError(null);
    if (side === "front") setIdFront(file);
    else setIdBack(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!university) {
      setError("Please select your university.");
      return;
    }

    if (!idFront) {
      setError("Please upload the front of your student ID.");
      return;
    }

    setLoading(true);

    try {
      // Get current user session for the API call
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in first to verify your student status.");
        return;
      }

      // Upload student ID photos to Supabase Storage
      let frontUrl = "";
      try {
        frontUrl = await uploadFileToSupabase(idFront, "verification-docs", session.user.id);
      } catch {
        setError("Failed to upload the front ID image. Please try again.");
        return;
      }
      
      let backUrl = "";
      if (idBack) {
        try {
          backUrl = await uploadFileToSupabase(idBack, "verification-docs", session.user.id);
        } catch {
          setError("Failed to upload the back ID image. Please try again.");
          return;
        }
      }

      const res = await apiFetch("/api/v1/auth/verify/upload", {
        method: "POST",
        body: JSON.stringify({
          imagePath: frontUrl,
          ...(backUrl ? { backImagePath: backUrl } : {}),
          universityName: university,
        }),
      }) as { success: boolean; error?: { message: string } };

      if (!res.success) {
        setError(res.error?.message || "Verification submission failed.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // If registered with email confirmation pending, show "check email" state
  if (emailParam && !isAutoVerified && !submitted) {
    // Email confirmation message (not student verification)
    return (
      <main className="min-h-screen flex items-center justify-center bg-campus-form-bg p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="p-8 bg-campus-card border border-white/5 rounded-2xl shadow-2xl">
            <span className="material-symbols-outlined text-status-info text-5xl mb-4 block">
              mark_email_unread
            </span>
            <h2 className="text-2xl font-bold text-white mb-3">
              Check Your Email
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We&apos;ve sent a confirmation email to{" "}
              <span className="text-white font-medium">{emailParam}</span>.
              Click the link in the email to verify your account and access
              U-Shop.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Didn&apos;t receive it? Check your spam folder.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  // If verification was submitted successfully
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-campus-form-bg p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="p-8 bg-campus-card border border-white/5 rounded-2xl shadow-2xl">
            <span className="material-symbols-outlined text-status-success text-5xl mb-4 block">
              verified
            </span>
            <h2 className="text-2xl font-bold text-white mb-3">
              Verification Submitted!
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your student verification is under review. We&apos;ll notify you
              within 24-48 hours once it&apos;s approved. You can still use
              U-Shop while we verify.
            </p>
          </div>

          <button
            onClick={() => {
              router.push("/dashboard");
              router.refresh();
            }}
            className="w-full bg-gradient-brand text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            Continue to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* ── Left Side: Hero ───────────────────────────────────── */}
      <section className="relative w-full md:w-1/2 min-h-[400px] md:min-h-screen bg-campus-dark flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay — real Ghanaian students photo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero/verify.png"
            alt="Ghanaian university students on campus"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-campus-dark via-transparent to-campus-dark/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-ushop-purple/20 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-16 max-w-xl">
          <Link href="/" className="mb-8 inline-block">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Verify Your <span className="text-status-info">Student</span>{" "}
            Status.
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Unlock exclusive deals and campus delivery. Join thousands of
            students getting the best tech at U-Shop.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-status-info">
                school
              </span>
              <span className="text-sm text-white font-medium">
                Student Pricing
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-status-info">
                local_shipping
              </span>
              <span className="text-sm text-white font-medium">
                Free Campus Delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Side: Form ──────────────────────────────────── */}
      <section className="w-full md:w-1/2 bg-campus-form-bg p-8 md:p-16 lg:p-24 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              Verification
            </h2>
            <p className="text-gray-400">
              Please provide your institutional details to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
              <p className="text-sm text-status-error font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* University Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">
                Select University
              </label>
              <div className="relative">
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-campus-input border border-gray-700 text-white py-3 px-4 rounded-xl appearance-none focus:ring-2 focus:ring-status-info outline-none transition-all"
                >
                  <option disabled value="">
                    {universitiesLoading ? "Loading universities..." : "Choose your institution"}
                  </option>
                  {universities.map((uni) => (
                    <option key={uni.slug} value={uni.slug}>
                      {uni.name} ({uni.shortName})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <span className="material-symbols-outlined">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Student Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">
                Student Email Address
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full bg-campus-input border border-gray-700 text-white py-3 px-4 rounded-xl focus:ring-2 focus:ring-status-info outline-none transition-all placeholder:text-gray-500"
                placeholder="yourname@st.ug.edu.gh"
              />
            </div>

            {/* Upload ID Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">
                  Student ID (Front)
                </label>
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className={`border-2 border-dashed ${
                    idFront
                      ? "border-status-success bg-status-success/5"
                      : "border-gray-700 hover:border-status-info bg-campus-input"
                  } p-6 text-center cursor-pointer transition-colors group rounded-xl`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      idFront
                        ? "text-status-success"
                        : "text-gray-500 group-hover:text-status-info"
                    } mb-2 block`}
                  >
                    {idFront ? "check_circle" : "upload_file"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {idFront ? idFront.name.slice(0, 20) : "Upload Front"}
                  </span>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "front")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">
                  Student ID (Back)
                </label>
                <div
                  onClick={() => backInputRef.current?.click()}
                  className={`border-2 border-dashed ${
                    idBack
                      ? "border-status-success bg-status-success/5"
                      : "border-gray-700 hover:border-status-info bg-campus-input"
                  } p-6 text-center cursor-pointer transition-colors group rounded-xl`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      idBack
                        ? "text-status-success"
                        : "text-gray-500 group-hover:text-status-info"
                    } mb-2 block`}
                  >
                    {idBack ? "check_circle" : "upload_file"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {idBack ? idBack.name.slice(0, 20) : "Upload Back"}
                  </span>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "back")}
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex gap-3 p-3 bg-status-info/10 border border-status-info/20 rounded-xl">
              <span className="material-symbols-outlined text-status-info text-sm">
                shield
              </span>
              <p className="text-[11px] text-gray-400">
                Your information is encrypted and only used for verification
                purposes.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !university || !idFront}
              className="w-full bg-gradient-brand text-white py-4 font-bold text-lg rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit for Verification"}
            </button>

            {/* Skip */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
