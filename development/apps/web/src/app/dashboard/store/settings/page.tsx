import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";
import SettingsForm from "./SettingsForm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Server action style / SSR fetch for current store
async function fetchMyStore() {
  // Using explicit API fetch passing the cookie over dynamically to our Express API
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sb-access-token")?.value || cookieStore.get("sb-session")?.value; // Depending on Supabase SSR config
  
  if (!sessionToken) return null;

  try {
    // Instead of a dedicated /my-store route, we parse from user payload
    const userRes = await apiFetch("/api/v1/users/me", {
      headers: {
         // Note: Express API validate token hook
         Authorization: `Bearer ${sessionToken}`
      }
    });

    if (!userRes.success || !userRes.data?.store) return null;
    return userRes.data.store;
  } catch {
    return null;
  }
}

export default async function StoreSettingsPage() {
  const store = await fetchMyStore();

  if (!store) {
    redirect("/dashboard/store/create");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h1>
        <p className="text-gray-500">Manage your bio, policies, and store configurations.</p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />}>
        <SettingsForm initialStore={store} />
      </Suspense>
    </div>
  );
}
