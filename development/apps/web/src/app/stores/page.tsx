import { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api-server";
import Image from "next/image";

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
  const stores = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-campus-dark pb-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          All Stores
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Discover trusted student sellers across campuses. Look out for the <span className="text-status-success font-bold">Verified</span> badge.
        </p>
      </div>

      {stores.length === 0 ? (
         <div className="w-full py-20 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-3xl">
           <span className="material-symbols-outlined text-6xl text-white/30 mb-4">storefront</span>
           <h3 className="text-2xl font-bold text-white mb-2">No stores active right now</h3>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stores.map((store: StoreOption) => (
             <Link key={store.id} href={`/store/${store.handle}`}>
               <div className="group bg-campus-form-bg justify-between flex flex-col border border-white/5 rounded-3xl p-6 hover:-translate-y-2 hover:border-ushop-purple/50 transition-all shadow-lg overflow-hidden h-full">
                  <div className="flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-white/5 overflow-hidden relative mb-4">
                        {store.logoUrl ? (
                          <Image src={store.logoUrl} alt={store.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">storefront</span>
                        )}
                     </div>
                     <h3 className="text-xl font-bold text-white mb-1">{store.name}</h3>
                     <p className="text-gray-400 text-sm mb-3">@{store.handle}</p>
                     
                     <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {store.user?.verificationStatus === "VERIFIED" && (
                          <span className="px-2 py-1 bg-status-success/20 text-status-success text-xs font-bold rounded flex items-center">
                            <span className="material-symbols-outlined text-[12px] mr-1">verified</span> Verified
                          </span>
                        )}
                        {store.user?.universityName && (
                          <span className="px-2 py-1 bg-white/10 text-white text-xs font-bold rounded">
                            {store.user.universityName.toUpperCase()}
                          </span>
                        )}
                     </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between gap-4 text-center items-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-full">
                       <span className="text-ushop-purple font-medium text-sm">Visit Store &rarr;</span>
                     </div>
                  </div>
               </div>
             </Link>
          ))}
        </div>
      )}
    </main>
  );
}
