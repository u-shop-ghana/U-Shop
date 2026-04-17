import { apiFetch } from "@/lib/api-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

// Re-use logic fetching active bounds
async function fetchStoreAndListings() {
  try {
    const userRes = await apiFetch("/api/v1/users/me");

    if (!userRes.success || !userRes.data?.store) return { store: null, listings: [] };
    const storeId = userRes.data.store.id;

    // Fetch listings matching storeId securely
    const listingsRes = await apiFetch(`/api/v1/listings?storeId=${storeId}&limit=50`, {
      method: 'GET'
    });

    return { 
      store: userRes.data.store, 
      listings: listingsRes.success ? listingsRes.data : [] 
    };
  } catch {
    return { store: null, listings: [] };
  }
}

export default async function ManageListingsPage() {
  const { store, listings } = await fetchStoreAndListings();

  if (!store) {
    redirect("/dashboard/store/create");
  }

  type ListingMetrics = { status: string; stock: number };
  const activeCount = listings.filter((l: ListingMetrics) => l.status === 'ACTIVE' && l.stock > 0).length;
  const outOfStockCount = listings.filter((l: ListingMetrics) => l.stock === 0).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Listings</h1>
          <p className="text-gray-400">Inventory overview: {activeCount} Active, {outOfStockCount} Out of Stock</p>
        </div>
        <Link
          href="/dashboard/store/listings/new"
          className="bg-ushop-purple hover:bg-ushop-purple/90 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Listing
        </Link>
      </div>

      <div className="bg-campus-dark rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/30 text-gray-400 border-b border-white/10 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-4xl mb-3 opacity-50">inventory_2</span>
                      <p>You haven&apos;t posted any listings yet.</p>
                      <Link href="/dashboard/store/listings/new" className="text-ushop-purple mt-2 hover:underline">
                        Create your first listing
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                listings.map((listing: { id: string; title: string; price: number; stock: number; status: string; createdAt: string; images?: string[] }) => (
                  <tr key={listing.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden relative flex-shrink-0">
                          {listing.images?.[0] ? (
                            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="48px" />
                          ) : (
                            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-600">image</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-ushop-purple transition-colors line-clamp-1">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(listing.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {formatCurrency(listing.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${listing.stock > 0 ? "bg-status-success/20 text-status-success" : "bg-status-error/20 text-status-error"}`}>
                        {listing.stock} {listing.stock > 0 ? "in stock" : "out"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-status-info/20 text-status-info">
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/listing/${listing.id}`} title="View public page" className="text-gray-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        <button title="Edit inventory" className="text-gray-400 hover:text-ushop-purple transition-colors">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
