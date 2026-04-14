"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const HERO_SLIDES = [
  {
    id: 1,
    tag1: "Campus Tech Hub",
    tag2: "Escrow Protected",
    titleStart: "Power Your",
    titleHighlight: "Academic Excellence",
    description:
      "The ultimate tech marketplace for Ghanaian students. Genuine gear, campus delivery, and student-first pricing.",
    primaryButton: { text: "Shop Deals", href: "/search" },
    secondaryButton: { text: "Sell Now", href: "/dashboard/store/create" },
    image: "/assets/images/hero/homepage.png",
    priceTag: "GH₵ 1,500",
  },
  {
    id: 2,
    tag1: "Sell Your Gear",
    tag2: "Instant Verified Buyers",
    titleStart: "Upgrade Your",
    titleHighlight: "Tech Setup",
    description:
      "Make money from your old laptops and phones. Reach thousands of verified students across Ghana easily.",
    primaryButton: { text: "Start Selling", href: "/dashboard/store/create" },
    secondaryButton: { text: "Learn More", href: "/how-it-works" },
    image: "/assets/images/categories/laptop.jpg",
    priceTag: "Top Value",
  },
  {
    id: 3,
    tag1: "Student Discounts",
    tag2: "Up to 40% Off",
    titleStart: "Exclusive Deals",
    titleHighlight: "For Your Campus",
    description:
      "Grab massive discounts with your student ID. Flash sales running all semester on top brands.",
    primaryButton: { text: "View Offers", href: "/student-deals" },
    secondaryButton: { text: "Browse All", href: "/search" },
    image: "/assets/images/categories/Gaming.png",
    priceTag: "Save Big",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative bg-gradient-to-r from-ushop-purple to-[#3b0a63] text-white overflow-hidden min-h-[500px] flex items-center">
      {/* Background vector */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 640 640">
          <path
            d="M320 0C143.269 0 0 143.269 0 320C0 496.731 143.269 640 320 640C496.731 640 640 496.731 640 320C640 143.269 496.731 0 320 0Z"
            fill="#D4009B"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10 w-full">
        {/* Slide Tracker */}
        <div className="absolute top-4 left-4 md:left-auto md:right-4 flex gap-2">
          {HERO_SLIDES.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentSlide === index ? "w-8 bg-ushop-pink" : "w-3 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center transition-opacity duration-500" key={slide.id}>
          <div className="space-y-6 animate-in slide-in-from-left-8 fade-in duration-700">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex bg-ushop-pink px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
                {slide.tag1}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-100 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm">
                <span className="material-symbols-outlined text-[14px]">gpp_good</span>
                {slide.tag2}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
              {slide.titleStart}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ushop-pink to-[#1275e2]">
                {slide.titleHighlight}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-lg">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={slide.primaryButton.href}
                className="bg-white text-ushop-purple px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all inline-flex items-center gap-2 group"
              >
                {slide.primaryButton.text}{" "}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <Link
                href={slide.secondaryButton.href}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-ushop-purple transition-all"
              >
                {slide.secondaryButton.text}
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block animate-in slide-in-from-right-8 fade-in duration-700">
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500 bg-white/5">
                <Image
                  fill
                  priority={currentSlide === 0}
                  src={slide.image}
                  alt={slide.titleHighlight}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-6">
                <p className="text-gray-600 text-sm">Now Offering</p>
                <p className="text-ushop-purple text-2xl font-bold">{slide.priceTag}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
