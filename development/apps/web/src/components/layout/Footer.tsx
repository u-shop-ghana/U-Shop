"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

// ─── Footer Component ───────────────────────────────────────────
// Full-width footer matching design/ui-kit/organisms/footer.png.
// Sections: Brand, Quick Links, Customer Service, Contact Us,
//           Newsletter, Legal links, Payment logos.
// Payment logos from: /assets/icons/footer/

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("email", email);
    
    const result = await subscribeToNewsletter(formData);
    
    if (result.error) {
       setStatus("error");
       setMessage(result.error);
    } else {
       setStatus("success");
       setMessage(result.message || "Subscribed successfully!");
    }
  };
    <footer className="bg-[#0f172a] text-gray-300 mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1 mb-4">
              <div className="bg-red-600 w-8 h-8 flex items-center justify-center rounded-lg">
                <span className="text-white font-extrabold text-base">U</span>
              </div>
              <span className="text-white font-extrabold text-lg">shop</span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Ghana&apos;s leading tech marketplace for students. Affordable
              devices, trusted sellers, campus delivery.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#6B1FA8] transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#6B1FA8] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#6B1FA8] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#6B1FA8] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/search" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/categories/laptops" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/categories/phones" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Phones
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/student-deals" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Student Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Help Center / FAQ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <span className="material-symbols-outlined text-base text-[#D4009B]">
                  call
                </span>
                +233 50 956 5794
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <span className="material-symbols-outlined text-base text-[#D4009B]">
                  mail
                </span>
                support@ushop.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <span className="material-symbols-outlined text-base text-[#D4009B]">
                  location_on
                </span>
                Accra, Ghana
              </li>
              <li className="text-sm text-gray-400">
                <span className="font-bold text-white">Mon – Sat:</span> 8am -
                8pm
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6B1FA8]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#D4009B]">
                  mail
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  Join the Newsletter
                </p>
                <p className="text-xs text-gray-400">
                  Get the latest student deals delivered to your inbox.
                </p>
              </div>
            </div>
            <div className="flex w-full md:w-auto">
              {status === "success" ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 rounded-xl text-emerald-400 w-full md:w-[350px]">
                   <span className="material-symbols-outlined text-xl">check_circle</span>
                   <span className="text-sm font-medium">{message}</span>
                </div>
              ) : (
                <form
                  className="flex flex-col sm:flex-row w-full md:w-[350px] gap-2 sm:gap-0"
                  onSubmit={handleSubscribe}
                >
                  <div className="flex w-full">
                    <input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      disabled={status === "loading"}
                      className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-l-xl
                        placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#6B1FA8]
                        w-full disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading" || !email}
                      className="px-6 py-2.5 bg-[#D4009B] text-white text-sm font-bold rounded-r-xl
                        hover:bg-[#b50f7e] transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[110px]"
                    >
                      {status === "loading" ? (
                         <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : "SUBSCRIBE"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0">{message}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — legal + payment logos */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2026 U-Shop. All rights reserved.</p>

            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Payment logos from /assets/icons/footer/ */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">WE ACCEPT:</span>
              <Image
                src="/assets/icons/footer/Momo.png"
                alt="Mobile Money"
                width={32}
                height={24}
                className="h-6 w-auto"
              />
              <Image
                src="/assets/icons/footer/TCash.png"
                alt="Telecel Cash"
                width={32}
                height={24}
                className="h-6 w-auto"
              />
              <Image
                src="/assets/icons/footer/AT money.png"
                alt="AT Money"
                width={32}
                height={24}
                className="h-6 w-auto"
              />
              <Image
                src="/assets/icons/footer/visa.png"
                alt="Visa"
                width={32}
                height={24}
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
