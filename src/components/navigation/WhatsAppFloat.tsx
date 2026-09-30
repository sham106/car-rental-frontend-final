import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { BRAND } from '../../constants/theme';
import { useSearch } from '../../context/SearchContext';

interface WhatsAppFloatProps {
  customVehicleName?: string;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ customVehicleName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pickupDate, returnDate } = useSearch();

  const formattedPickup = pickupDate || 'upcoming trip';
  const formattedReturn = returnDate || 'later';

  const defaultMessage = customVehicleName
    ? `Hello, I am interested in the ${customVehicleName} from ${formattedPickup} to ${formattedReturn}. Could you confirm availability?`
    : `Hello DailyCar, I would like to inquire about car hire availability in Mauritius from ${formattedPickup} to ${formattedReturn}.`;

  const [message, setMessage] = useState(defaultMessage);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${BRAND.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div id="whatsapp-concierge-container" className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <div
          id="whatsapp-chat-popup"
          className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#DFE6EC] overflow-hidden transition-all duration-200"
        >
          {/* Header */}
          <div className="bg-[#16324F] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2F6F6D] flex items-center justify-center text-white font-bold text-sm">
                OC
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight">DailyCar Concierge</h4>
                <span className="text-[11px] text-[#EAF0F3]/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Typically replies in minutes
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Close WhatsApp chat popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSend} className="p-4 bg-[#F8F6F1] space-y-3">
            <p className="text-xs text-[#66747E]">
              Chat directly with our on-island operations team for instant availability queries, flight coordination, or special requests:
            </p>

            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#CAD5DF] bg-white text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] resize-none"
              placeholder="Type your message..."
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#66747E]">Opens in WhatsApp</span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#2F6F6D] hover:bg-[#235856] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Send WhatsApp</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id="whatsapp-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-[#2F6F6D] hover:bg-[#235856] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2F6F6D]"
        aria-label="Chat with car rental concierge on WhatsApp"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="font-semibold text-xs sm:text-sm tracking-tight pr-1">
          WhatsApp Concierge
        </span>
      </button>
    </div>
  );
};
