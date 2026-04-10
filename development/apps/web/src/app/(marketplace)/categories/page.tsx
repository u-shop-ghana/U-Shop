import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@ushop/shared";

import { ClientCategoryList } from "@/components/ui/ClientCategoryList";

export const metadata: Metadata = {
  title: "Explore Categories | U-Shop",
  description: "Find the best tech essentials for your academic journey on U-Shop.",
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

// Short descriptions for each category matching the Figma design
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  laptops: "MacBooks, Windows Ultrabooks & Gaming rigs.",
  phones: "Latest iPhones, Samsung Galaxy & Pixel devices.",
  tablets: "iPads and Android tablets for note-taking.",
  accessories: "Chargers, headphones, and student essentials.",
  gaming: "Consoles, controllers, and immersive gear.",
  storage: "External SSDs, Hard drives & Flash drives.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-neutral-900 relative">
      <div className="absolute top-0 w-full h-[50vh] bg-[#0f172a] overflow-hidden">
        <Image
          src="/assets/images/hero/categories browsing.png"
          alt="Tech categories"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]/90" />
      </div>

      <ClientCategoryList 
        categories={CATEGORIES}
        images={CATEGORY_IMAGES}
        descriptions={CATEGORY_DESCRIPTIONS}
      />
    </main>
  );
}
