import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api-server";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

// Map university short names to local images
const UNI_IMAGES: Record<string, string> = {
  ug: "/assets/images/universities/legon.jpg",
  knust: "/assets/images/universities/knust.jpg",
  ucc: "/assets/images/universities/ucc.jpg",
  gctu: "/assets/images/universities/gctu.jpg",
  umat: "/assets/images/universities/umat.jpeg",
};

export const metadata: Metadata = {
  title: "Campus Directory | U-Shop",
  description: "Browse hardware deals locked to specific University campuses.",
};

export const dynamic = "force-dynamic";

export default async function UniversitiesPage() {
  const res = await apiFetch("/api/v1/universities");
  const universities: UniversityOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Campus Directory
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Filter hardware specifically sold by students verified at your institution for safe campus meetups.
          </p>
        </div>

        {universities.length === 0 ? (
          <div className="w-full p-12 text-center border border-gray-200 bg-gray-50 rounded-2xl">
             <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">school</span>
             <p className="text-gray-500 text-lg">No active campuses found at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni: UniversityOption) => (
              <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
                <div className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-5">
                  {/* University logo */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden relative flex-shrink-0 bg-gray-100 border border-gray-200">
                    <Image
                      fill
                      src={UNI_IMAGES[uni.shortName.toLowerCase()] || "/assets/images/universities/legon.jpg"}
                      alt={uni.shortName}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-ushop-purple transition-colors">
                      {uni.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      {uni.shortName}
                    </p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all">
                     <span className="material-symbols-outlined text-ushop-purple">arrow_forward</span>
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
