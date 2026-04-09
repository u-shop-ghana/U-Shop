import { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api-server";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

export const metadata: Metadata = {
  title: "Campus Directory | U-Shop",
  description: "Browse hardware deals locked to specific University campuses.",
};

export const dynamic = "force-dynamic";

export default async function UniversitiesPage() {
  const res = await apiFetch("/api/v1/universities");
  const universities = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-campus-dark pb-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Campus Match
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Filter hardware specifically sold by students verified at your institution for completely completely safe and free campus meetups.
        </p>
      </div>

      {universities.length === 0 ? (
        <div className="w-full p-12 text-center border border-white/5 bg-white/5 rounded-3xl">
           <p className="text-gray-400 text-lg">No active campuses found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni: UniversityOption) => (
            <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
              <div className="group relative flex items-center p-6 bg-campus-form-bg border border-white/5 rounded-3xl hover:-translate-y-1 hover:border-ushop-purple/50 transition-all overflow-hidden h-full shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-ushop-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mr-6 border border-white/20">
                    <span className="material-symbols-outlined text-3xl text-white">school</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white group-hover:text-ushop-purple transition-colors">
                    {uni.shortName}
                  </h3>
                  <p className="text-sm font-medium text-gray-400 line-clamp-1">
                    {uni.name}
                  </p>
                </div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                   <span className="material-symbols-outlined text-white">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
