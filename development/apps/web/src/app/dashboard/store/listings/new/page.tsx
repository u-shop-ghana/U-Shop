"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CATEGORIES } from "@ushop/shared";
import { createClient } from "@/lib/supabase/client";
import { uploadFileToSupabase } from "@/lib/supabase/storage";
import { apiFetch } from "@/lib/api";

const CONDITIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "REFURBISHED", label: "Refurbished" },
];

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("BRAND_NEW");
  const [stock, setStock] = useState("1");
  const [tags, setTags] = useState("");

  // Files & Previews
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    // Limits
    if (files.length + newFiles.length > 6) {
      setError("You can only upload up to 6 images.");
      return;
    }

    const validFiles = newFiles.filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );

    if (validFiles.length < newFiles.length) {
      setError("Some files were rejected. Must be <10MB and an image type.");
    } else {
      setError(null);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]!);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (files.length < 1) { // MVP allows 1+ images, ideal is 3-6
      setError("Please upload at least 1 image of the product.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 1. Upload Images to Supabase 'product-images' bucket
      const uploadedImagePaths: string[] = [];
      for (const file of files) {
        // uploadFileToSupabase returns the public URL
        const publicUrl = await uploadFileToSupabase(file, 'product-images', session.user.id);
        uploadedImagePaths.push(publicUrl);
      }

      // 2. Submit to our Express Backend
      const payload = {
        title,
        description,
        price: parseFloat(price),
        categoryId,
        condition,
        stock: parseInt(stock, 10),
        images: uploadedImagePaths,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await apiFetch('/api/v1/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.success) {
        throw new Error(res.error?.message || "Failed to create listing");
      }

      // Redirect to the manageable inventory grid
      router.push("/dashboard/store/listings");
      router.refresh();
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Listing</h1>
        <p className="text-gray-400">Post a new piece of tech to your store inventory.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-xl">
          <p className="text-sm font-medium text-status-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Section */}
        <section className="bg-campus-form-bg p-6 rounded-2xl border border-white/5 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-4">Product Details</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">Title</label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none transition-all placeholder:text-gray-500"
              placeholder="e.g., MacBook Pro M1 2020 16GB"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none appearance-none"
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Condition</label>
              <select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none appearance-none"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Price (GH₵)</label>
              <input
                type="number"
                required
                min={0}
                max={100000}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none transition-all placeholder:text-gray-500"
                placeholder="2500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Stock</label>
              <input
                type="number"
                required
                min={1}
                max={999}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">Description (Supports Markdown format)</label>
            <textarea
              required
              minLength={50}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none transition-all resize-y placeholder:text-gray-500"
              placeholder="Provide exact specs, usage history, any defects..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 block">Tags (Optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none transition-all placeholder:text-gray-500 relative"
              placeholder="e.g. macbook, apple, m1, 16gb"
            />
            <p className="text-xs text-gray-500">Comma separated tags help with search discovery.</p>
          </div>
        </section>

        {/* Media Section */}
        <section className="bg-campus-form-bg p-6 rounded-2xl border border-white/5 space-y-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Images</h2>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-700 text-gray-300 rounded-lg">{files.length} / 6 Uploaded</span>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Upload clear, well-lit photos. The first photo will be your main thumbnail.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, idx) => (
              <div key={preview} className="relative aspect-square rounded-xl overflow-hidden group bg-campus-dark border border-gray-700">
                <Image src={preview} alt="Listing Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-status-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                  <span className="material-symbols-outlined text-sm block">delete</span>
                </button>
              </div>
            ))}
            
            {files.length < 6 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-ushop-purple hover:bg-ushop-purple/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-gray-400 mb-2">add_photo_alternate</span>
                <span className="text-sm font-medium text-gray-400">Add Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-bold hover:shadow-lg hover:shadow-ushop-purple/20 transition-all active:scale-[0.98] disabled:opacity-50 min-w-[160px] flex justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Publish Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
