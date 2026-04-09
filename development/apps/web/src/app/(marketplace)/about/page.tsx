import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | U-Shop',
  description: "Learn about U-Shop — Ghana's trusted student tech marketplace built for campus life.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-ushop-purple to-[#3b0a63] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="material-symbols-outlined text-sm">school</span>
            <span className="text-sm font-medium">Built for Ghanaian Students</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            About U-Shop
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            We&apos;re on a mission to make quality tech accessible to every student
            across Ghana&apos;s university campuses — safely, affordably, and with
            full buyer protection.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                U-Shop was founded with a simple belief: every Ghanaian student deserves
                access to the tools they need to succeed academically — without breaking
                the bank or risking a scam.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We connect verified student sellers with buyers across campuses, backed
                by escrow payment protection so both sides of every transaction are safe.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'verified', label: 'Verified Sellers', value: '500+' },
                { icon: 'school', label: 'Universities', value: '20+' },
                { icon: 'shopping_bag', label: 'Transactions', value: '10K+' },
                { icon: 'star', label: 'Avg. Rating', value: '4.8★' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#f8fafc] rounded-2xl p-6 text-center border border-gray-100"
                >
                  <span className="material-symbols-outlined text-3xl text-ushop-purple mb-2 block">
                    {stat.icon}
                  </span>
                  <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: 'verified_user',
                title: 'Trust & Safety',
                description:
                  'Every seller is verified and every payment is held in escrow until the buyer confirms receipt.',
              },
              {
                icon: 'diversity_3',
                title: 'Community First',
                description:
                  'We exist to serve the student community — from Legon to KNUST, UCC to Ashesi and beyond.',
              },
              {
                icon: 'local_offer',
                title: 'Student Pricing',
                description:
                  'Peer-to-peer trading means real savings. No middlemen, no inflated retail markups.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-ushop-purple">
                    {value.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Ready to join the community?
          </h2>
          <p className="text-gray-500 mb-8">
            Whether you&apos;re buying your first laptop or selling last semester&apos;s gear,
            U-Shop has you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="bg-ushop-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3b0a63] transition-colors"
            >
              Start Shopping
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold hover:border-ushop-purple hover:text-ushop-purple transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
