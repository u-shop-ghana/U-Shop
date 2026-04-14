"use client";

import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/lib/api-client";
import { uploadFileToSupabase } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function CreateStorePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    bio: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const debounceTimerUrl = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      };

      const resp = await apiFetch("/api/v1/stores", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.success) {
        throw new Error(resp.error?.message || "Failed to create store");
      }

      // Success! Push directly inside their configured store settings mapping
      router.push(`/store/${formData.handle}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Store</h1>
        <p className="text-gray-500">Configure your storefront to start selling across campus.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        
        {/* Profile Branding Module */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Branding</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-1.5">Store Logo</p>
              <p className="text-xs text-gray-400 mb-4">Recommended: 400x400px (1:1)</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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
                <div className="h-20 flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden group relative">
                    {bannerFile ? (
                      <Image src={URL.createObjectURL(bannerFile)} alt="Banner Preview" fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-400">burst_mode</span>
                    )}
                </div>
                <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleImageChange(e, "banner")} className="max-w-[120px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Basic Details Module */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Store Name" 
              placeholder="e.g. Jane's Tech Deals" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />

            <div>
              <Input 
                label="Store Slug (URL)" 
                placeholder="janes-tech" 
                value={formData.handle}
                onChange={handleHandleChange}
                required
                maxLength={40}
                leftIcon={<span className="text-gray-400">/store/</span>}
                error={handleAvailable === false ? "This handle is unavailable." : undefined}
                helperText={handleAvailable === true ? "This handle is available!" : checkingHandle ? "Checking..." : "Alphanumeric and dashes only."}
              />
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

        <div className="pt-4 flex items-center justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading} className="mr-3">
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
