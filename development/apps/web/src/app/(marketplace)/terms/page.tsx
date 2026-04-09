import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | U-Shop',
  description: 'Read the U-Shop Terms of Service governing your use of the platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            By using U-Shop, you agree to these terms. Please read them carefully.
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
              'Acceptance of Terms',
              'Eligibility',
              'User Accounts',
              'Buying and Selling',
              'Escrow & Payments',
              'Prohibited Conduct',
              'Intellectual Property',
              'Limitation of Liability',
              'Changes to Terms',
              'Contact',
            ].map((item, i) => (
              <li key={item}>
                <a
                  href={`#terms-${i + 1}`}
                  className="text-sm text-ushop-purple hover:underline font-medium"
                >
                  {i + 1}. {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Terms Content */}
        <div className="space-y-10 text-gray-700">
          <section id="terms-1">
            <h2 className="text-2xl font-black text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using U-Shop (&quot;the Platform&quot;), you agree to be bound by
              these Terms of Service and our{' '}
              <Link href="/privacy" className="text-ushop-purple hover:underline font-medium">
                Privacy Policy
              </Link>
              . If you do not agree, please do not use the Platform.
            </p>
          </section>

          <section id="terms-2">
            <h2 className="text-2xl font-black text-gray-900 mb-4">2. Eligibility</h2>
            <p className="leading-relaxed">
              You must be at least 18 years old (or the age of majority in your jurisdiction)
              to use U-Shop. By creating an account, you confirm that you meet this requirement.
              Sellers must additionally complete our student or business verification process
              before listing items.
            </p>
          </section>

          <section id="terms-3">
            <h2 className="text-2xl font-black text-gray-900 mb-4">3. User Accounts</h2>
            <p className="leading-relaxed mb-3">
              You are responsible for maintaining the confidentiality of your account
              credentials and for all activity that occurs under your account. You agree to:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                'Provide accurate and truthful information when registering',
                'Keep your password secure and not share it with others',
                'Notify us immediately of any unauthorised use of your account',
                'Not create multiple accounts to circumvent bans or restrictions',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="terms-4">
            <h2 className="text-2xl font-black text-gray-900 mb-4">4. Buying and Selling</h2>
            <p className="leading-relaxed mb-3">
              U-Shop is a peer-to-peer marketplace. We facilitate transactions but are not
              a party to the sale between buyers and sellers. By listing or purchasing an item:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                'Sellers must accurately describe items, including condition, specifications, and any defects.',
                'Sellers must only list items they own and have the right to sell.',
                'Buyers must pay promptly and confirm receipt honestly.',
                'Both parties must communicate respectfully and in good faith.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-ushop-purple rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="terms-5">
            <h2 className="text-2xl font-black text-gray-900 mb-4">5. Escrow &amp; Payments</h2>
            <p className="leading-relaxed">
              All payments on U-Shop are processed through our escrow system. Funds are held
              securely until the buyer confirms receipt of the item. U-Shop charges a platform
              fee on each completed transaction, deducted from the seller&apos;s payout. Fees are
              displayed clearly before listing. Refunds are subject to our{' '}
              <Link href="/returns" className="text-ushop-purple hover:underline font-medium">
                Returns &amp; Refunds Policy
              </Link>
              .
            </p>
          </section>

          <section id="terms-6">
            <h2 className="text-2xl font-black text-gray-900 mb-4">6. Prohibited Conduct</h2>
            <p className="leading-relaxed mb-3">You may not use U-Shop to:</p>
            <ul className="space-y-2 pl-4">
              {[
                'List counterfeit, stolen, or illegal items',
                'Engage in fraud, misrepresentation, or scams',
                'Harass, threaten, or abuse other users',
                'Circumvent our payment system by transacting off-platform',
                'Scrape, copy, or reproduce platform content without permission',
                'Violate any applicable Ghanaian or international law',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="leading-relaxed mt-4 text-sm">
              Violations may result in immediate account suspension and, where applicable,
              referral to law enforcement.
            </p>
          </section>

          <section id="terms-7">
            <h2 className="text-2xl font-black text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on U-Shop — including the logo, design, code, and copy — is owned
              by U-Shop or its licensors. You retain ownership of content you upload (photos,
              descriptions) but grant U-Shop a non-exclusive licence to display it on the
              platform. You may not reproduce or redistribute U-Shop content without written
              permission.
            </p>
          </section>

          <section id="terms-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              U-Shop is provided &quot;as is&quot;. To the maximum extent permitted by law, U-Shop
              is not liable for any indirect, incidental, or consequential damages arising
              from your use of the platform, including disputes between buyers and sellers.
              Our total liability in any matter is limited to the fees paid by you to U-Shop
              in the 30 days preceding the claim.
            </p>
          </section>

          <section id="terms-9">
            <h2 className="text-2xl font-black text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms from time to time. We will notify you of material
              changes via email or a prominent notice on the platform. Continued use of
              U-Shop after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section id="terms-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4">10. Contact</h2>
            <p className="leading-relaxed">
              Questions about these Terms? Contact us at:
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
          <Link href="/privacy" className="text-sm text-ushop-purple hover:underline font-medium">
            Privacy Policy →
          </Link>
          <Link href="/cookies" className="text-sm text-ushop-purple hover:underline font-medium">
            Cookie Policy →
          </Link>
          <Link href="/returns" className="text-sm text-ushop-purple hover:underline font-medium">
            Returns &amp; Refunds →
          </Link>
        </div>
      </div>
    </main>
  );
}
