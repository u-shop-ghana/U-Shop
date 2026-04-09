import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | U-Shop',
  description: 'Get in touch with the U-Shop support team. We\'re here to help.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
            Have a question, issue, or just want to say hi? We&apos;re always happy to hear
            from the U-Shop community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Channels */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Reach Us Directly</h2>

            {[
              {
                icon: 'call',
                label: 'Phone / WhatsApp',
                value: '+233 50 956 5794',
                sub: 'Mon – Sat, 8am – 8pm',
                href: 'tel:+233509565794',
              },
              {
                icon: 'mail',
                label: 'Email Support',
                value: 'support@ushop.com',
                sub: 'We reply within 24 hours',
                href: 'mailto:support@ushop.com',
              },
              {
                icon: 'location_on',
                label: 'Office',
                value: 'Accra, Ghana',
                sub: 'Greater Accra Region',
                href: null,
              },
            ].map((channel) => (
              <div
                key={channel.label}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-ushop-purple">
                    {channel.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {channel.label}
                  </p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="text-lg font-bold text-gray-900 hover:text-ushop-purple transition-colors"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="text-lg font-bold text-gray-900">{channel.value}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-0.5">{channel.sub}</p>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Facebook', href: 'https://facebook.com' },
                  { label: 'Instagram', href: 'https://instagram.com' },
                  { label: 'X (Twitter)', href: 'https://x.com' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-ushop-purple hover:text-ushop-purple transition-all"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Kwame Mensah"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ushop-purple focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="kwame@ug.edu.gh"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ushop-purple focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-ushop-purple focus:border-transparent text-sm bg-white"
                >
                  <option value="">Select a topic…</option>
                  <option value="order">Order Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="seller">Seller Dispute</option>
                  <option value="account">Account Help</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Describe your issue or question in detail…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ushop-purple focus:border-transparent text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-ushop-purple text-white py-3.5 rounded-xl font-bold hover:bg-[#3b0a63] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
