import Link from "next/link";
import Image from "next/image";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    handle: string;
    logoUrl?: string;
    user?: {
      verificationStatus?: string;
      universityName?: string;
    };
  };
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/store/${store.handle}`}>
      <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col">
        {/* Store header image area — uses logo or campus placeholder */}
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={store.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-gray-300">storefront</span>
            </div>
          )}
          {/* Storefront icon badge */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <span className="material-symbols-outlined text-ushop-purple text-lg">storefront</span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 group-hover:text-ushop-purple transition-colors">{store.name}</h3>
            {store.user?.verificationStatus === "VERIFIED" && (
              <span className="material-symbols-outlined text-sm text-green-500" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">@{store.handle}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {store.user?.universityName && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded">
                <span className="text-gray-400 text-[8px]">●</span> University
                <span className="text-gray-800 ml-0.5">{store.user.universityName}</span>
              </span>
            )}
          </div>

          {/* Browse Store CTA */}
          <button className="w-full py-2.5 bg-ushop-purple text-white text-sm font-bold rounded-xl group-hover:bg-ushop-purple/90 transition-colors flex items-center justify-center gap-1">
            Browse Store <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
