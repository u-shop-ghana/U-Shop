import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api-server';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const res = await apiFetch(`/api/v1/listings/${resolvedParams.id}`);
  
  if (!res.success || !res.data) {
    return { title: 'Product Not Found | U-Shop' };
  }
  
  const listing = res.data;
  return {
    title: `${listing.title} | U-Shop`,
    description: listing.description.substring(0, 160),
    openGraph: {
      images: listing.images?.[0] ? [listing.images[0]] : [],
    }
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const res = await apiFetch(`/api/v1/listings/${resolvedParams.id}`);

  if (!res.success || !res.data) {
    notFound();
  }

  const listing = res.data;
  const store = listing.store;
  const isStudentSeller = store.sellerType === 'STUDENT';

  return (
    <main className="min-h-screen bg-campus-dark text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-400 mb-8 border-b border-white/10 pb-4">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2 material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href={`/categories/${listing.category.slug}`} className="hover:text-white transition-colors">{listing.category.name}</Link>
          <span className="mx-2 material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-gray-300 truncate">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Image Gallery MVP */}
          <div className="w-full lg:w-3/5 space-y-4">
            <div className="relative aspect-square md:aspect-[4/3] w-full bg-black/50 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
               <Image 
                  src={listing.images[0] || '/assets/images/defaults/placeholder.webp'}
                  alt={listing.title}
                  fill
                  className="object-contain"
                  priority
               />
               <div className="absolute top-4 left-4 z-10 flex gap-2">
                 <Badge variant="info">
                   {listing.condition.replace(/_/g, ' ')}
                 </Badge>
                 {listing.stock === 0 && (
                   <Badge variant="error">OUT OF STOCK</Badge>
                 )}
               </div>
            </div>
            
            {/* Thumbnails (if > 1) */}
            {listing.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {listing.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl border-2 border-transparent hover:border-ushop-purple cursor-pointer overflow-hidden flex-shrink-0 bg-black/50 snap-center transition-colors">
                     <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Checkout & Details */}
          <div className="w-full lg:w-2/5 flex flex-col pt-2">
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {listing.title}
            </h1>
            
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-brand mb-6">
              {formatCurrency(listing.price)}
            </div>

            {/* Store Card Badge */}
            <Link href={`/store/${store.handle}`} className="group block mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-600 overflow-hidden relative shadow-inner">
                  {store.logoUrl ? (
                    <Image src={store.logoUrl} alt={store.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-500">store</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-bold text-white text-lg leading-none">{store.name}</h3>
                    {store.user?.verificationStatus === 'VERIFIED' && (
                      <span className="material-symbols-outlined text-status-success text-[18px]" title="Identity Verified">verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                     <span className="flex items-center text-status-warning text-xs font-bold gap-0.5">
                       <span className="material-symbols-outlined text-[14px]">star</span>
                       {store.averageRating.toFixed(1)}
                     </span>
                     <span>• {store.reviewCount} reviews</span>
                     {isStudentSeller && (
                        <span className="px-2 py-0.5 ml-2 bg-ushop-purple/20 text-ushop-purple rounded-full text-[10px] font-bold uppercase tracking-wider">
                           Student Auth
                        </span>
                     )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Checkout / CTA */}
            <div className="space-y-4 mb-10 pt-6 border-t border-white/10">
              <button 
                disabled={listing.stock === 0}
                className="w-full py-4 rounded-xl bg-gradient-brand text-white font-bold text-lg shadow-xl hover:shadow-ushop-purple/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {listing.stock > 0 ? 'Buy via U-Shop Escrow' : 'Out of Stock'}
              </button>
              
              <button 
                className="w-full py-4 rounded-xl bg-black/40 border border-white/10 text-white font-bold hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                Add to Cart
              </button>

              {/* Escrow Disclaimer */}
              <div className="flex items-center gap-3 p-4 bg-status-success/10 border border-status-success/20 rounded-xl mt-4">
                 <span className="material-symbols-outlined text-status-success text-[24px]">verified_user</span>
                 <p className="text-xs text-status-success font-medium">
                   <strong className="block mb-0.5">Protected by U-Shop Escrow.</strong>
                   Seller doesn&apos;t get paid until you confirm receipt.
                 </p>
              </div>
            </div>

            {/* Specifics & Description */}
            <div className="space-y-8 pb-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Item Specifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-gray-500 mb-1">Condition</p>
                    <p className="font-semibold text-gray-200">{listing.condition.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-gray-500 mb-1">Stock Left</p>
                    <p className="font-semibold text-gray-200">{listing.stock}</p>
                  </div>
                  <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-gray-500 mb-1">Return Window</p>
                    <p className="font-semibold text-gray-200">{store.returnWindow} Days</p>
                  </div>
                  <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-gray-500 mb-1">Posted On</p>
                    <p className="font-semibold text-gray-200">{new Date(listing.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
