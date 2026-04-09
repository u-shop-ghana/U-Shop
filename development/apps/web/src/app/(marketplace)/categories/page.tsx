import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@ushop/shared";

export const metadata: Metadata = {
  title: "Browse Categories | U-Shop",
  description: "Explore tech categories on U-Shop.",
};

// Map category slugs to local images from /public/assets/images/categories/
const CATEGORY_IMAGES: Record<string, string> = {
  laptops: "/assets/images/categories/laptop.jpg",
  phones: "/assets/images/categories/phone.png",
  accessories: "/assets/images/categories/Accessories.png",
  tablets: "/assets/images/categories/Tablet.png",
  gaming: "/assets/images/categories/Gaming.png",
  storage: "/assets/images/categories/storage.png",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Tech Categories
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Browse specialized hardware departments to find exactly what you need for your coursework and campus life.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] shadow-md hover:-translate-y-1 transition-all">
                <Image
                  fill
                  src={CATEGORY_IMAGES[cat.slug] || "/assets/images/categories/laptop.jpg"}
                  alt={cat.name}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-3xl mb-2 block">{cat.iconUrl}</span>
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
