import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Returns & Refunds | U-Shop',
  description: 'Understand the U-Shop returns and refunds policy. Buyer protection on every transaction.',
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <span className="material-symbols-outlined text-sm text-green-600">verified_user</span>
            <span className="text-sm font-bold text-green-700">Buyer Protected</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Returns &amp; Refunds
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Your purchase is protected by our escrow system. If something goes wrong,
            we&apos;ve got you covered.
          </p>
          <p className="text-sm text-gray-400 mt-3">Last updated: January 2026</p>
        </div>

        {/* How Escrow Works */}
        <section className="mb-10 bg-purple-50 border border-purple-100 rounded-2xl p-8">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-ushop-purple">lock</span>
            How Our Escrow Protection Works
          </h2>
          <ol className="space-y-3">
            {[
              'You pay for an item — funds are held securely in escrow, not released to the seller yet.',
              'The seller ships or delivers the item to you.',
              'You inspect the item and confirm receipt if everything is as described.',
              'Funds are released to the seller only after your confirmation.',
              "If there's a problem, you open a dispute before confirming — your money stays protected.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 bg-ushop-purple text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* Policy Sections */}
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Eligible Return Reasons</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may open a dispute and request a refund if any of the following apply:
            </p>
            <ul className="space-y-2">
              {[
                'Item is significantly different from the listing description or photos.',
                'Item is damaged, broken, or non-functional upon arrival.',
                'Item was never delivered within the agreed timeframe.',
                'Wrong item was sent by the seller.',
                'Item is counterfeit or not as advertised.',
              ].map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="material-symbols-outlined text-base text-green-500 mt-0.5 shrink-0">
                    check_circle
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">How to Open a Dispute</h2>
            <div className="space-y-3">
              {[
                { icon: 'dashboard', text: 'Go to your order in the Dashboard.' },
                { icon: 'report', text: 'Click "Open Dispute" before confirming receipt.' },
                { icon: 'description', text: 'Describe the issue and attach photos if possible.' },
                { icon: 'support_agent', text: 'Our team will review and respond within 24 hours.' },
                { icon: 'payments', text: 'If the dispute is resolved in your favour, a full refund is issued.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#f8fafc] border border-gray-200 rounded-xl p-4">
                  <span className="material-symbols-outlined text-xl text-ushop-purple shrink-0">
                    {step.icon}
                  </span>
                  <p className="text-sm text-gray-700">{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Refund Timelines</h2>
            <p className="text-gray-600 leading-relaxed">
              Once a dispute is resolved in the buyer&apos;s favour, refunds are processed
              within <strong>3–5 business days</strong> back to the original payment method.
              Mobile Money refunds are typically faster (1–2 business days).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Non-Returnable Situations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Disputes cannot be opened after you have confirmed receipt of the item.
              Please inspect your purchase carefully before confirming. Additionally,
              change-of-mind returns are not covered by our policy — only issues with
              the item itself.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#f8fafc] border border-gray-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Have a problem with an order?</h3>
          <p className="text-gray-500 text-sm mb-6">
            Our support team is ready to help resolve any issue quickly and fairly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="bg-ushop-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3b0a63] transition-colors inline-flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-lg">support_agent</span>
              Contact Support
            </Link>
            <Link
              href="/help"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold hover:border-ushop-purple hover:text-ushop-purple transition-all inline-flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-lg">help</span>
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
