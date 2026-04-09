import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Center | U-Shop',
  description: 'Find answers to common questions about buying, selling, payments, and delivery on U-Shop.',
};

const FAQ_ITEMS = [
  {
    category: 'Buying',
    icon: 'shopping_bag',
    questions: [
      {
        q: 'How do I place an order?',
        a: "Browse listings, click on an item you like, and follow the checkout flow. Your payment is held in escrow until you confirm receipt of the item.",
      },
      {
        q: 'Is my payment safe?',
        a: "Yes. All payments are protected by our escrow system. Your money is only released to the seller after you confirm you've received the item in the described condition.",
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept Mobile Money (MTN MoMo, Telecel Cash, AT Money) and major debit/credit cards (Visa, Mastercard).',
      },
    ],
  },
  {
    category: 'Selling',
    icon: 'storefront',
    questions: [
      {
        q: 'How do I start selling on U-Shop?',
        a: 'Create an account, verify your student status, then open your store from the dashboard. You can list your first item in minutes.',
      },
      {
        q: 'When do I receive my payment?',
        a: 'Funds are released from escrow to your account once the buyer confirms receipt — typically within 24–48 hours of delivery.',
      },
      {
        q: 'Are there any seller fees?',
        a: 'U-Shop charges a small platform fee on each successful transaction. Full fee details are available in your seller dashboard.',
      },
    ],
  },
  {
    category: 'Delivery',
    icon: 'local_shipping',
    questions: [
      {
        q: 'Do you deliver to my campus?',
        a: 'We support campus delivery to all major Ghanaian universities including UG, KNUST, UCC, GCTU, and more. Check the listing for specific delivery options.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Delivery times vary by seller and location, but most campus deliveries are completed within 1–3 business days.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: 'replay',
    questions: [
      {
        q: "What if the item doesn't match the description?",
        a: "Don't confirm receipt if the item is not as described. Open a dispute through your order page and our team will mediate and issue a refund if warranted.",
      },
      {
        q: 'How do I request a refund?',
        a: 'Go to your order in the dashboard, select "Open Dispute", and describe the issue. Our support team responds within 24 hours.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Help Center
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
            Everything you need to know about buying and selling on U-Shop.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {FAQ_ITEMS.map((section) => (
            <a
              key={section.category}
              href={`#${section.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-ushop-purple hover:bg-purple-50 transition-all group"
            >
              <span className="material-symbols-outlined text-2xl text-ushop-purple mb-2 group-hover:scale-110 transition-transform">
                {section.icon}
              </span>
              <span className="text-sm font-bold text-gray-700 group-hover:text-ushop-purple transition-colors">
                {section.category}
              </span>
            </a>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {FAQ_ITEMS.map((section) => (
            <section
              key={section.category}
              id={section.category.toLowerCase().replace(/\s+/g, '-')}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-ushop-purple">
                    {section.icon}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">{section.category}</h2>
              </div>
              <div className="space-y-4">
                {section.questions.map((item) => (
                  <div
                    key={item.q}
                    className="bg-[#f8fafc] border border-gray-200 rounded-xl p-6"
                  >
                    <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2">
                      <span className="material-symbols-outlined text-lg text-ushop-purple mt-0.5 shrink-0">
                        help
                      </span>
                      {item.q}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed pl-7">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 bg-gradient-to-r from-ushop-purple to-[#3b0a63] rounded-2xl p-10 text-center text-white">
          <span className="material-symbols-outlined text-4xl mb-4 block">support_agent</span>
          <h2 className="text-2xl font-black mb-3">Still need help?</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Our support team is available Monday to Saturday, 8am – 8pm. We typically
            respond within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="bg-white text-ushop-purple px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all inline-flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              Contact Support
            </Link>
            <a
              href="tel:+233509565794"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-ushop-purple transition-all inline-flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
