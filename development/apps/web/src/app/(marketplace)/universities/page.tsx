import { Metadata } from "next";
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
    <main className="min-h-screen bg-white relative">
      <ClientUniversityList 
        universities={universities}
        images={UNI_IMAGES}
        locations={UNI_LOCATIONS}
      />
    </main>
  );
}
