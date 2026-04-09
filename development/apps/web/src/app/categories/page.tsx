import { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@ushop/shared";

export const metadata: Metadata = {
  title: "Browse Categories | U-Shop",
  description: "Explore tech categories on U-Shop.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-campus-dark pb-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Tech Categories
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Browse specialized hardware departments to find exactly what you need for your coursework and dorm layout.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/categories/${cat.slug}`}>
            <div className="group flex flex-col items-center justify-center p-8 bg-campus-form-bg border border-white/5 rounded-3xl hover:bg-white/5 hover:-translate-y-2 hover:border-ushop-purple/50 transition-all backdrop-blur-xl shadow-xl h-full">
              <span className="text-5xl mb-4 group-hover:scale-125 group-hover:-rotate-3 transition-transform duration-300">
                {cat.iconUrl}
              </span>
              <span className="font-bold text-gray-300 group-hover:text-white text-center">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
