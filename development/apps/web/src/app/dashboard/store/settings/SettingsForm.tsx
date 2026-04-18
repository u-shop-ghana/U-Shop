"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { 
  RETURN_WINDOWS, 
  RETURN_CONDITIONS, 
  RETURN_SHIPPING_COSTS, 
  WARRANTY_PERIODS, 
  WARRANTY_COVERAGES, 
  REFUND_METHODS 
} from "@ushop/shared";

export default function SettingsForm({ initialStore }: { initialStore: Record<string, unknown> }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: (initialStore.name as string) || "",
    bio: (initialStore.bio as string) || "",
    returnWindow: (initialStore.returnWindow as string) || "NO_RETURNS",
    returnCondition: (initialStore.returnCondition as string) || "SAME_CONDITION",
    returnShippingCost: (initialStore.returnShippingCost as string) || "BUYER_PAYS",
    warrantyPeriod: (initialStore.warrantyPeriod as string) || "NONE",
    warrantyCoverage: (initialStore.warrantyCoverage as string) || "DOA",
    refundMethod: (initialStore.refundMethod as string) || "WALLET_CREDIT",
    policyNotes: (initialStore.policyNotes as string) || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        bio: formData.bio || undefined,
        returnWindow: formData.returnWindow,
        returnCondition: formData.returnCondition,
        returnShippingCost: formData.returnShippingCost,
        warrantyPeriod: formData.warrantyPeriod,
        warrantyCoverage: formData.warrantyCoverage,
        refundMethod: formData.refundMethod,
        policyNotes: formData.policyNotes || undefined,
      };

      const resp = await apiFetch(`/api/v1/stores/${initialStore.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!resp.success) {
        throw new Error(resp.error?.message || "Failed to update store settings.");
      }

      setSuccess(true);
      router.refresh();
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
          Settings successfully updated. Policies marked restricted are pending admin approval.
        </div>
      )}

      <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">General Settings</h2>
        
        <Input 
          label="Store Name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Textarea 
          label="Store Bio" 
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={280}
        />
      </section>

      <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900 inline-flex items-center gap-2">
            Store Policies 
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">Requires Admin Approval</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Updates to these fields will be queued for review.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Return Window</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.returnWindow}
              onChange={(e) => setFormData({ ...formData, returnWindow: e.target.value })}
            >
              {RETURN_WINDOWS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Return Condition</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.returnCondition}
              onChange={(e) => setFormData({ ...formData, returnCondition: e.target.value })}
            >
              {RETURN_CONDITIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Return Shipping Cost</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.returnShippingCost}
              onChange={(e) => setFormData({ ...formData, returnShippingCost: e.target.value })}
            >
              {RETURN_SHIPPING_COSTS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Warranty Period</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.warrantyPeriod}
              onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
            >
              {WARRANTY_PERIODS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Warranty Coverage</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.warrantyCoverage}
              onChange={(e) => setFormData({ ...formData, warrantyCoverage: e.target.value })}
            >
              {WARRANTY_COVERAGES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Refund Method</label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple"
              value={formData.refundMethod}
              onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
            >
              {REFUND_METHODS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Textarea 
          label="Policy Notes" 
          placeholder="Specific warranty conditions, exceptions..." 
          value={formData.policyNotes}
          onChange={(e) => setFormData({ ...formData, policyNotes: e.target.value })}
        />
      </section>

      <div className="pt-4 flex items-center justify-end">
        <Button type="submit" loading={loading} disabled={loading}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}
