import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api-server";

interface StoreOption {
  id: string;
  name: string;
  handle: string;
  logoUrl?: string;
  user?: {
    verificationStatus?: string;
    universityName?: string;
  };
}

export const metadata: Metadata = {
  title: "Stores Directory | U-Shop",
  description: "Browse verified student stores offering tech across campus.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const res = await apiFetch(`/api/v1/stores?page=${page}&limit=24`);
  const stores: StoreOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            All Stores
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Discover trusted student sellers across campuses. Look for the <span className="text-green-600 font-bold">Verified</span> badge.
          </p>
        </div>

        {stores.length === 0 ? (
           <div className="w-full py-20 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl">
             <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">storefront</span>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">No stores active right now</h3>
             <p className="text-gray-500">Check back later or be the first to open a store!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stores.map((store: StoreOption) => (
               <Link key={store.id} href={`/store/${store.handle}`}>
                 <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center text-center h-full">
                    {/* Store Logo */}
                    <div className="w-20 h-20 rounded-full border-2 border-gray-100 bg-gray-50 overflow-hidden relative mb-4">
                       {store.logoUrl ? (
                         <Image src={store.logoUrl} alt={store.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                       ) : (
                         <span className="material-symbols-outlined text-3xl text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">storefront</span>
                       )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-ushop-purple transition-colors">{store.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">@{store.handle}</p>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 justify-center mt-auto">
                       {store.user?.verificationStatus === "VERIFIED" && (
                         <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                           <span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings: '"FILL" 1'}}>verified</span> Verified
                         </span>
                       )}
                       {store.user?.universityName && (
                         <span className="px-2 py-1 bg-purple-50 text-ushop-purple text-xs font-bold rounded-full">
                           {store.user.universityName.toUpperCase()}
                         </span>
                       )}
                    </div>

                    {/* Visit Store CTA */}
                    <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                       <span className="text-ushop-purple font-semibold text-sm group-hover:underline">Visit Store &rarr;</span>
                    </div>
                 </div>
               </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
