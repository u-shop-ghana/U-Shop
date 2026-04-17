"use client";

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { uploadFileToSupabase } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

export default function CreateStorePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    bio: "",
    sellerType: "STUDENT",
    contactEmail: "",
    contactPhone: "",
    location: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const debounceTimerUrl = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  interface University {
    id: string;
    name: string;
  }
  
  interface UserProfile {
    id: string;
    email: string;
    role: "BUYER" | "SELLER" | "BOTH" | "ADMIN";
    verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
    verificationType: "STUDENT_ID" | "GHANA_CARD" | null;
  }
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    // Fetch configuration data on mount
    apiFetch("/api/v1/universities").then(res => {
      if (res.success && Array.isArray(res.data)) {
        setUniversities(res.data);
      }
    });

    apiFetch("/api/v1/users/me").then(res => {
      if (res.success) {
        setUserProfile(res.data);
      }
    });
  }, []);

  // Debounced Handle Availability Check
  const handleHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (raw.startsWith("-")) raw = raw.slice(1);
    
    setFormData((prev) => ({ ...prev, handle: raw }));
    
    if (raw.length < 3) {
      setHandleAvailable(null);
      return;
    }

    setCheckingHandle(true);
    setHandleAvailable(null);

    if (debounceTimerUrl.current) clearTimeout(debounceTimerUrl.current);
    
    debounceTimerUrl.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/v1/stores/check-handle/${raw}`);
        if (res.success && res.data) {
          setHandleAvailable(res.data.available);
        }
      } catch {
        // Silently skip check bounces
      } finally {
        setCheckingHandle(false);
      }
    }, 500);
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Images must be strictly JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Images must be under 2MB.");
      return;
    }

    setError(null);
    if (type === "logo") setLogoFile(file);
    else setBannerFile(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Initial blocks
    if (!formData.name || !formData.handle) {
      setError("Name and Handle are required.");
      return;
    }

    if (handleAvailable === false) {
      setError("This URL slug is already taken.");
      return;
    }

    // Role-specific blocks before API submission
    if (formData.sellerType === "STUDENT") {
      if (userProfile?.verificationStatus !== "VERIFIED") {
        router.push("/verify");
        return;
      }
    }

    if (formData.sellerType === "RESELLER") {
      if (userProfile?.verificationStatus !== "VERIFIED") {
        router.push("/reseller-verify");
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Must be logged in to create a store.");
      }

      let uploadedLogoUrl = "";
      let uploadedBannerUrl = "";

      // Parallelly dispatch strictly native uploads targeting store-assets bucket
      const uploadPromises = [];
      if (logoFile) {
        uploadPromises.push(
          uploadFileToSupabase(logoFile, "store-assets", session.user.id)
            .then(url => { uploadedLogoUrl = url; })
        );
      }

      if (bannerFile) {
        uploadPromises.push(
          uploadFileToSupabase(bannerFile, "store-assets", session.user.id)
            .then(url => { uploadedBannerUrl = url; })
        );
      }

      await Promise.all(uploadPromises);

      // Create payload resolving the specific API inputs
      const payload = {
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio || undefined,
        logoUrl: uploadedLogoUrl || undefined,
        bannerUrl: uploadedBannerUrl || undefined,
        sellerType: formData.sellerType,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        location: formData.location || undefined,
      };

      const resp = await apiFetch("/api/v1/stores", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.success) {
        throw new Error(resp.error?.message || "Failed to create store");
      }

      // Success! Push directly inside their configured store settings mapping
      if (formData.sellerType === "STUDENT" && userProfile?.verificationStatus !== "VERIFIED") {
        router.push(`/verify`); // Safety fallback, though caught above natively
      } else {
        router.push(`/store/${formData.handle}`);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-8 border-b pb-8">
        <Link href="/" className="inline-block mb-6">
          <Image
            src="/assets/logos/web/logo-300w.png"
            alt="U-Shop Logo"
            width={160}
            height={48}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Your Storefront</h1>
        <p className="text-gray-500 mt-2 text-center max-w-lg">Configure your store to start selling across campus. Fill out the details below to define your brand identity.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start">
          <span className="material-symbols-outlined mr-3 text-red-500 text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Primary Wrapper */}
      <form onSubmit={onSubmit} className="space-y-10">
        
        {/* Profile Branding Module */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
             <span className="material-symbols-outlined mr-2 text-ushop-purple">palette</span> Branding
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-1.5">Store Logo</p>
              <p className="text-xs text-gray-400 mb-4">Recommended: 400x400px (1:1)</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 transition-hover hover:border-ushop-purple">
                  {logoFile ? (
                    <Image src={URL.createObjectURL(logoFile)} alt="Logo Preview" width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-gray-400">add_photo_alternate</span>
                  )}
                </div>
                <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageChange(e, "logo")} className="flex-1" />
              </div>
            </div>

            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-1.5">Store Banner</p>
              <p className="text-xs text-gray-400 mb-4">Recommended: 1200x400px (3:1)</p>
              <div className="flex items-center gap-4">
                <div className="h-20 flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden group relative transition-hover hover:border-ushop-purple">
                    {bannerFile ? (
                      <Image src={URL.createObjectURL(bannerFile)} alt="Banner Preview" fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400">burst_mode</span>
                    )}
                </div>
                <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageChange(e, "banner")} className="w-[110px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Basic Details Module */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <span className="material-symbols-outlined mr-2 text-ushop-purple">info</span> Store Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Store Name" 
              placeholder="e.g. Campus Kicks" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />

            <div>
              <Input 
                label="Store Slug (URL)" 
                placeholder="your-store-name" 
                value={formData.handle}
                onChange={handleHandleChange}
                required
                maxLength={40}
                leftIcon={<span className="text-gray-400 pl-2 text-sm select-none">u-shop.app/store/</span>}
                error={handleAvailable === false ? "This handle is unavailable." : undefined}
                helperText={handleAvailable === true ? "This handle is available!" : checkingHandle ? "Checking..." : "Letters, numbers, and dashes only."}
              />
            </div>
            
            <div className="md:col-span-2">
              <Select
                label="Seller Type"
                value={formData.sellerType}
                onChange={(e) => setFormData({ ...formData, sellerType: e.target.value, location: "" })}
                required
              >
                <option value="STUDENT">Student Seller</option>
                <option value="RESELLER">Reseller</option>
              </Select>
            </div>
          </div>

          <Textarea 
            label="Store Bio" 
            placeholder="Tell buyers what kind of items you specialize in..." 
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={280}
            helperText={`${formData.bio.length} / 280 characters`}
          />
        </section>
        
        {/* Contact & Location Module */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
             <span className="material-symbols-outlined mr-2 text-ushop-purple">contact_page</span> Context & Contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Contact Email" 
              type="email"
              placeholder="store@example.com" 
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              helperText="Buyers will reach out via this email."
            />

            <Input 
              label="Contact Phone"
              type="tel" 
              placeholder="024XXXXXXX" 
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              helperText="Optional phone for direct calls."
            />
            
            <div className="md:col-span-2">
              {formData.sellerType === "STUDENT" ? (
                <Select
                  label="Location (University)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Select your university map..."
                  required
                >
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.name}>{uni.name}</option>
                  ))}
                </Select>
              ) : (
                <Input 
                  label="Location (Address/City)" 
                  placeholder="e.g. East Legon, Accra" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              )}
            </div>
            
          </div>
        </section>

        <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow border z-10">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={handleAvailable === false || !formData.name || !formData.handle}>
            Create Storefront
          </Button>
        </div>
      </form>
    </div>
  );
}
