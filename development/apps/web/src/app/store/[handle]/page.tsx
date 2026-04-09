import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
// Note: If you don't have Badge component, we can use simple divs instead.

// This runs entirely on the server
async function getStore(handle: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/api/v1/stores/${handle}`, {
      // Dynamic rendering, or revalidate every hour depending on traffic scale
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function PublicStorePage({ params }: { params: { handle: string } }) {
  const store = await getStore(params.handle);

  if (!store) {
    notFound();
  }

  // Determine Verification level UI tags
  const isVerifiedStore = store.user?.verificationStatus === "VERIFIED";

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <div className="w-full h-48 md:h-64 bg-gray-200 relative overflow-hidden">
        {store.bannerUrl ? (
          <Image 
            src={store.bannerUrl} 
            alt={`${store.name} banner`} 
            fill 
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#520f85] to-[#d41295] opacity-80" />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-3rem] md:mt-[-4rem] relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm flex-shrink-0">
            {store.logoUrl ? (
              <Image 
                src={store.logoUrl} 
                alt={`${store.name} logo`} 
                width={128} 
                height={128} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-3xl">
                {store.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              {store.name}
              {isVerifiedStore && (
                <span className="material-symbols-outlined text-blue-500 text-xl" title="Verified Seller">
                  verified
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">@{store.handle}</p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">star</span>
                {store.averageRating > 0 ? store.averageRating.toFixed(1) : "New"}
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                {store.totalSales} sales
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full md:w-auto">
            <Button variant="outline" fullWidth>
              Message Seller
            </Button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">About Store</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                {store.bio || "This store hasn't added a bio yet."}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Policies</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[20px] text-gray-400">assignment_return</span>
                  <span>{store.returnWindow} Days Return Window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[20px] text-gray-400">inventory_2</span>
                  <span>Returns: {store.returnCondition.replace("_", " ")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Listings Payload Grid */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-6 text-center py-20">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">inventory</span>
              <h3 className="font-bold text-gray-900">Listings Integration Pending</h3>
              <p className="text-gray-500 text-sm mt-1">Products will populate here soon.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
