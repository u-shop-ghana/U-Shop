import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | U-Shop',
  description: 'Learn how U-Shop uses cookies and similar technologies on our platform.',
};

const COOKIE_TYPES = [
  {
    name: 'Essential Cookies',
    icon: 'lock',
    required: true,
    description:
      'These cookies are necessary for the platform to function. They enable core features like authentication, session management, and security. You cannot opt out of these.',
    examples: ['Authentication session token', 'CSRF protection token', 'Load balancer routing'],
  },
  {
    name: 'Functional Cookies',
    icon: 'tune',
    required: false,
    description:
      'These cookies remember your preferences and settings to provide a more personalised experience.',
    examples: ['Language preference', 'Recently viewed items', 'Search filter preferences'],
  },
  {
    name: 'Analytics Cookies',
    icon: 'bar_chart',
    required: false,
    description:
      'These cookies help us understand how visitors use U-Shop so we can improve the platform. Data is aggregated and anonymised.',
    examples: ['Page views and navigation paths', 'Feature usage statistics', 'Error tracking'],
  },
  {
    name: 'Marketing Cookies',
    icon: 'campaign',
    required: false,
    description:
      'These cookies are used to show you relevant ads and promotions. We do not sell your data to advertisers.',
    examples: ['Ad personalisation', 'Conversion tracking', 'Retargeting'],
  },
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            This policy explains how U-Shop uses cookies and similar tracking technologies
            when you visit our platform.
          </p>
          <p className="text-sm text-gray-400 mt-3">Last updated: January 2026</p>
        </div>

        {/* What Are Cookies */}
        <section className="mb-10 bg-[#f8fafc] border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-ushop-purple">info</span>
            What Are Cookies?
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Cookies are small text files stored on your device when you visit a website.
            They help the site remember information about your visit — like whether you&apos;re
            logged in — so you don&apos;t have to re-enter it every time. We also use similar
            technologies like local storage and session storage for the same purposes.
          </p>
        </section>

        {/* Cookie Types */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Types of Cookies We Use</h2>
          <div className="space-y-5">
            {COOKIE_TYPES.map((type) => (
              <div
                key={type.name}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl text-ushop-purple">
                        {type.icon}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{type.name}</h3>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      type.required
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {type.required ? 'Always Active' : 'Optional'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{type.description}</p>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Examples
                  </p>
                  <ul className="space-y-1">
                    {type.examples.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-600 leading-relaxed mb-4 text-sm">
            You can control non-essential cookies through your browser settings. Most browsers
            allow you to block or delete cookies. Note that disabling certain cookies may
            affect the functionality of U-Shop.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { browser: 'Google Chrome', icon: 'settings' },
              { browser: 'Mozilla Firefox', icon: 'settings' },
              { browser: 'Safari', icon: 'settings' },
              { browser: 'Microsoft Edge', icon: 'settings' },
            ].map((b) => (
              <div
                key={b.browser}
                className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-xl text-gray-400">{b.icon}</span>
                <span className="text-sm font-medium text-gray-700">{b.browser}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Refer to your browser&apos;s help documentation for instructions on managing cookies.
          </p>
        </section>

        {/* Third-Party */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            We use a small number of trusted third-party services that may set their own
            cookies, including Vercel Analytics (performance monitoring) and Supabase
            (authentication). These services have their own privacy policies and we
            encourage you to review them.
          </p>
        </section>

        {/* Updates */}
        <section className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Updates to This Policy</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            We may update this Cookie Policy from time to time. We will notify you of
            significant changes by posting a notice on the platform. Continued use of
            U-Shop after changes take effect constitutes your acceptance.
          </p>
        </section>

        {/* Related Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
          <Link href="/privacy" className="text-sm text-ushop-purple hover:underline font-medium">
            Privacy Policy →
          </Link>
          <Link href="/terms" className="text-sm text-ushop-purple hover:underline font-medium">
            Terms of Service →
          </Link>
          <Link href="/contact" className="text-sm text-ushop-purple hover:underline font-medium">
            Contact Us →
          </Link>
        </div>
      </div>
    </main>
  );
}
