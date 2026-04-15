"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { uploadFileToSupabase } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResellerVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    ghanaCardName: "",
    ghanaCardId: "",
    ghanaCardDob: "",
  });

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Documents must be in JPEG, PNG, or WEBP format.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError(null);
    if (side === "front") setFrontImage(file);
    else setBackImage(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.ghanaCardName || !formData.ghanaCardId || !formData.ghanaCardDob) {
      setError("All text fields are required.");
      return;
    }

    if (!frontImage || !backImage) {
      setError("Please provide both front and back images of your Ghana Card.");
      return;
    }

    // GHA-Card ID validation (simple structural check)
    // format: GHA-123456789-1
    if (!/^GHA-\d{9}-\d$/.test(formData.ghanaCardId.toUpperCase())) {
      setError("Invalid Ghana Card ID Format. Use GHA-123456789-1");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Must be logged in to verify your identity.");
      }

      // Secure bucket upload for administrative checks only
      const [frontUrl, backUrl] = await Promise.all([
        uploadFileToSupabase(frontImage, "verification-docs", session.user.id),
        uploadFileToSupabase(backImage, "verification-docs", session.user.id)
      ]);

      const payload = {
        ...formData,
        ghanaCardId: formData.ghanaCardId.toUpperCase(),
        ghanaCardFrontImagePath: frontUrl,
        ghanaCardBackImagePath: backUrl,
      };

      const resp = await apiFetch("/api/v1/users/reseller-verify", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!resp.success) {
        throw new Error(resp.error?.message || "Failed to submit verification request");
      }

      setSuccess(true);
      // Wait shortly then eject back to the store dashboard or home
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Submitted</h1>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Your Reseller verification documents have been securely uploaded. Our team will review them shortly.
        </p>
        <Link href="/dashboard" className="text-[#6B1FA8] font-semibold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10">
      <div className="flex flex-col items-center justify-center mb-10 pb-8 border-b">
        <Link href="/" className="inline-block mb-6">
          <Image
            src="/assets/logo.svg"
            alt="U-Shop Logo"
            width={160}
            height={48}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reseller Verification</h1>
        <p className="text-gray-500 text-center mt-2 max-w-lg">
          To create a Reseller store, we require your official Ghana Card details to ensure a trusted marketplace environment.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start">
          <span className="material-symbols-outlined mr-3 text-red-500 text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        
        {/* Personal Details */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="material-symbols-outlined mr-2 text-[#6B1FA8]">badge</span> Identity Details
          </h2>

          <Input 
            label="Full Name (as it appears on your ID)" 
            placeholder="John Doe" 
            value={formData.ghanaCardName}
            onChange={(e) => setFormData({ ...formData, ghanaCardName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Ghana Card ID Number" 
              placeholder="GHA-123456789-1" 
              value={formData.ghanaCardId}
              onChange={(e) => setFormData({ ...formData, ghanaCardId: e.target.value })}
              required
            />

            <Input 
              label="Date of Birth"
              type="date" 
              value={formData.ghanaCardDob}
              onChange={(e) => setFormData({ ...formData, ghanaCardDob: e.target.value })}
              required
            />
          </div>
        </section>

        {/* Document Images */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="material-symbols-outlined mr-2 text-[#6B1FA8]">document_scanner</span> Secure Document Upload
          </h2>
          <p className="text-sm text-gray-500">Capture clear, unblurred photos of the front and back side of your physical card.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">Front Side</p>
              <div className="h-40 flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden group relative hover:border-[#6B1FA8] transition-colors">
                  {frontImage ? (
                    <Image src={URL.createObjectURL(frontImage)} alt="Front ID Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">id_card</span>
                      <span className="text-xs text-gray-400 font-medium">Click to upload</span>
                    </>
                  )}
                  <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, "front")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" required={!frontImage} />
              </div>
            </div>

            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">Back Side</p>
              <div className="h-40 flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden group relative hover:border-[#6B1FA8] transition-colors">
                  {backImage ? (
                    <Image src={URL.createObjectURL(backImage)} alt="Back ID Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-gray-400 text-3xl mb-1">flip_to_back</span>
                      <span className="text-xs text-gray-400 font-medium">Click to upload</span>
                    </>
                  )}
                  <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, "back")} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" required={!backImage} />
              </div>
            </div>
          </div>
        </section>

        <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow border z-10">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!formData.ghanaCardId || !frontImage || !backImage}>
            Submit For Review
          </Button>
        </div>
      </form>
    </div>
  );
}
