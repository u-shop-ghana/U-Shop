import { Metadata } from "next";
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

import { apiPublicFetch } from "@/lib/api-public";

interface CategoryData {
  name: string;
  slug: string;
  iconUrl?: string | null;
  _count?: {
    listings: number;
  };
}

export default async function CategoriesPage() {
  // Fetch real-time categories (which now includes _count.listings from the backend)
  const res = await apiPublicFetch("/api/v1/categories");
  // Fallback to static CATEGORIES if API fails, but map them to the same shape
  const activeCategories = res.success && res.data ? res.data : CATEGORIES.map(c => ({ ...c, _count: { listings: 0 } }));

  // We map the database categories to the Client props shape and inject real-time counts!
  const mappedCategories = activeCategories.map((cat: CategoryData) => ({
    name: cat.name,
    slug: cat.slug,
    iconUrl: cat.iconUrl,
    count: cat._count?.listings || 0
  }));

  return (
    <main className="min-h-screen bg-neutral-900 relative">
      <ClientCategoryList 
        categories={mappedCategories}
        images={CATEGORY_IMAGES}
        descriptions={CATEGORY_DESCRIPTIONS}
      />
    </main>
  );
}
