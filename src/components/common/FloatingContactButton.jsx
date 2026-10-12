import React, { useState } from 'react';
import { MessageCircle, Phone, X, Mail } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function FloatingContactButton() {
  const { getBrand } = useContent();
  const brand = getBrand();
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = brand.whatsapp_number || '919876543210';
  const phone = brand.support_phone || '+91 98765 43210';
  const email = brand.support_email || 'care@oct9.com';

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hello OCT9 Customer Care, I have an inquiry regarding my order / ethnic collection.'
  )}`;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-40 font-sans">
      {/* Expanded Quick Contact Popover */}
      {isOpen && (
        <div className="mb-3 bg-white border border-neutral-200 rounded-lg shadow-xl p-4 w-72 text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <p className="font-bold text-neutral-900 text-xs">Customer Support</p>
              <p className="text-[10px] text-neutral-500">Official Brand Helpline</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              aria-label="Close contact popover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2.5 p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-xs leading-tight">Chat on WhatsApp</p>
                <p className="text-[10px] text-emerald-600">Immediate response</p>
              </div>
            </a>

            <a
              href={`tel:${phone}`}
              className="flex items-center space-x-2.5 p-2 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition-colors"
            >
              <Phone className="w-4 h-4 text-neutral-600 shrink-0" />
              <div>
                <p className="font-semibold text-xs leading-tight">Call Helpline</p>
                <p className="text-[10px] text-neutral-500">{phone}</p>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center space-x-2.5 p-2 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition-colors"
            >
              <Mail className="w-4 h-4 text-neutral-600 shrink-0" />
              <div>
                <p className="font-semibold text-xs leading-tight">Email Support</p>
                <p className="text-[10px] text-neutral-500">{email}</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open customer support options"
        className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer flex items-center justify-center border border-white/20"
        title="Need Help? Contact Support"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default FloatingContactButton;
