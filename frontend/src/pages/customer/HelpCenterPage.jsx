import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { FiPhoneCall, FiMail, FiMessageSquare, FiChevronRight } from 'react-icons/fi';

const HelpCenterPage = () => {
  const contacts = [
    { label: 'Phone Support', value: '+91 98765 43210', icon: FiPhoneCall, color: 'text-green-600', bg: 'bg-green-50', href: 'tel:+919876543210' },
    { label: 'Email Support', value: 'contact@indhuvadhana.com', icon: FiMail, color: 'text-primary', bg: 'bg-cream', href: 'mailto:contact@indhuvadhana.com' },
    { label: 'WhatsApp Chat', value: '+91 98765 43210', icon: FiMessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', href: 'https://wa.me/919876543210' },
  ];

  const faqs = [
    { q: 'How do I track my order?', a: 'Go to My Orders in the Account section to see your order status.' },
    { q: 'What is the return policy?', a: 'We accept returns within 7 days of delivery for unused items in original packaging.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3–7 business days across India.' },
    { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled before they are shipped. Contact us immediately for changes.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <SEO title="Help Center" description="Contact IndhuVadhana support" />

      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-14">
        <h1 className="text-white text-2xl font-bold font-display">Help Center</h1>
        <p className="text-cream/80 text-sm mt-1">We're here to help you</p>
      </div>

      <div className="-mt-6 px-4 space-y-4">
        {/* Contact Options */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Us</div>
          {contacts.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className={`${c.bg} ${c.color} p-2.5 rounded-xl`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                  <p className="text-xs text-gray-500 truncate">{c.value}</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </a>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">FAQs</div>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <details key={i} className="group px-5 py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-sm text-gray-800 list-none">
                  {faq.q}
                  <FiChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
