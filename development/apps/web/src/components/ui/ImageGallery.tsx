"use client";

import { useState } from "react";
import Image from "next/image";

// ─── Image Gallery Component ────────────────────────────────────
// Matches Figma product detail: large main image with side thumbnails
// that highlight on hover/click. Thumbnails are stacked vertically on
// desktop (left side) and horizontally on mobile (below main image).
interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback if no images are provided
  const displayImages =
    images.length > 0 ? images : ["/assets/images/defaults/placeholder.webp"];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails — vertical strip on desktop, horizontal on mobile */}
      {displayImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] shrink-0 snap-x md:snap-y">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 snap-center transition-all ${
                idx === activeIndex
                  ? "border-ushop-purple shadow-md"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image — large display with badge area */}
      <div className="relative w-full aspect-square md:aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <Image
          src={displayImages[activeIndex]}
          alt={title}
          fill
          className="object-contain p-4"
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
        />
      </div>
    </div>
  );
}
