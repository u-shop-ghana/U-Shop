import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiPublicFetch } from "@/lib/api-public";

import { ClientUniversityList } from "@/components/ui/ClientUniversityList";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

// Map university short names to local campus images
const UNI_IMAGES: Record<string, string> = {
  ug: "/assets/images/universities/legon.jpg",
  knust: "/assets/images/universities/knust.jpg",
  ucc: "/assets/images/universities/ucc.jpg",
  gctu: "/assets/images/universities/gctu.jpg",
  umat: "/assets/images/universities/umat.jpeg",
};

// Map university short names to campus location strings (Figma reference)
const UNI_LOCATIONS: Record<string, string> = {
  ug: "Legon Main Campus",
  knust: "Kumasi Main Campus",
  ucc: "Cape Coast Campus",
  gctu: "Tesano, Accra",
  umat: "Tarkwa Campus",
};

export const metadata: Metadata = {
  title: "Partner Universities | U-Shop",
  description: "Explore campus-specific marketplaces across Ghana. Get delivery directly to your hostel or hall.",
};

export const revalidate = 15; // Enable Incremental Static Regeneration caching

export default async function UniversitiesPage() {
  const res = await apiPublicFetch("/api/v1/universities");
  const universities: UniversityOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-neutral-900 relative">
      <div className="absolute top-0 w-full h-[50vh] bg-[#0f172a] overflow-hidden">
        <Image
          src="/assets/images/hero/universities directory.png"
          alt="University campus"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]/90" />
      </div>

      <ClientUniversityList 
        universities={universities}
        images={UNI_IMAGES}
        locations={UNI_LOCATIONS}
      />

      {/* CTA Section — "Don't see your university?" matching Figma */}
      <section className="bg-ushop-purple mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-3xl mb-16">
        <div className="px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Don&apos;t see your university?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            We&apos;re rapidly expanding to more campuses across Ghana. Partner with us to bring U-Shop to your university today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="bg-white text-ushop-purple font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
              Suggest University
            </Link>
            <Link href="/contact" className="bg-white/10 border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors">
              Become an Ambassador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
