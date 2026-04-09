import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | U-Shop',
  description: 'Learn how U-Shop collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Your privacy matters to us. This policy explains what data we collect,
            how we use it, and the choices you have.
          </p>
          <p className="text-sm text-gray-400 mt-3">Last updated: January 2026</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 mb-10">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
            Contents
          </h2>
          <ol className="space-y-2">
            {[
              'Information We Collect',
              'How We Use Your Information',
              'Sharing Your Information',
              'Data Security',
              'Your Rights',
              'Cookies',
              'Contact Us',
            ].map((item, i) => (
              <li key={item}>
                <a
                  href={`#section-${i + 1}`}
                  className="text-sm text-ushop-purple hover:underline font-medium"
                >
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Policy Content */}
        <div className="space-y-10 text-gray-700">
          <section id="section-1">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed mb-3">
              We collect information you provide directly to us when you create an account,
              list an item, make a purchase, or contact support. This includes:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                'Name, email address, and phone number',
                'University affiliation and student verification documents',
                'Payment information (processed securely — we do not store card numbers)',
                'Delivery addresses',
                'Profile photos and store information',
                'Messages sent through our platform',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="leading-relaxed mt-4 text-sm">
              We also automatically collect certain technical data when you use our platform,
              including IP address, browser type, device information, and pages visited.
            </p>
          </section>

          <section id="section-2">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="space-y-2 pl-4">
              {[
                'Operate and improve the U-Shop marketplace',
                'Process transactions and manage escrow payments',
                'Verify student and seller identities',
                'Send order confirmations, receipts, and support responses',
                'Detect and prevent fraud or policy violations',
                'Send promotional emails (you can opt out at any time)',
                'Comply with legal obligations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="section-3">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. Sharing Your Information</h2>
            <p className="leading-relaxed mb-3">
              We do not sell your personal data. We may share your information with:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                'Payment processors to complete transactions securely',
                'Delivery partners to fulfil orders',
                'Other users only to the extent necessary to complete a transaction (e.g. your delivery address shared with a seller)',
                'Law enforcement or regulators when required by law',
                'Service providers who help us operate the platform (under strict data agreements)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="section-4">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We use industry-standard security measures including encryption in transit (TLS),
              secure authentication, and access controls to protect your data. However, no
              system is completely secure — please use a strong, unique password and keep
              your account credentials private.
            </p>
          </section>

          <section id="section-5">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Your Rights</h2>
            <p className="leading-relaxed mb-3">You have the right to:</p>
            <ul className="space-y-2 pl-4">
              {[
                'Access the personal data we hold about you',
                'Request correction of inaccurate data',
                'Request deletion of your account and associated data',
                'Opt out of marketing communications at any time',
                'Lodge a complaint with a data protection authority',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="leading-relaxed mt-4 text-sm">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@ushop.com" className="text-ushop-purple hover:underline font-medium">
                support@ushop.com
              </a>
              .
            </p>
          </section>

          <section id="section-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Cookies</h2>
            <p className="leading-relaxed">
              We use cookies and similar technologies to keep you logged in, remember your
              preferences, and understand how you use our platform. For full details, see
              our{' '}
              <Link href="/cookies" className="text-ushop-purple hover:underline font-medium">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section id="section-7">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data,
              please reach out:
            </p>
            <div className="mt-4 bg-[#f8fafc] border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
              <p>
                <span className="font-bold text-gray-900">Email:</span>{' '}
                <a href="mailto:support@ushop.com" className="text-ushop-purple hover:underline">
                  support@ushop.com
                </a>
              </p>
              <p>
                <span className="font-bold text-gray-900">Phone:</span> +233 50 956 5794
              </p>
              <p>
                <span className="font-bold text-gray-900">Address:</span> Accra, Ghana
              </p>
            </div>
          </section>
        </div>

        {/* Related Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
          <Link href="/terms" className="text-sm text-ushop-purple hover:underline font-medium">
            Terms of Service →
          </Link>
          <Link href="/cookies" className="text-sm text-ushop-purple hover:underline font-medium">
            Cookie Policy →
          </Link>
          <Link href="/contact" className="text-sm text-ushop-purple hover:underline font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </main>
  );
}
