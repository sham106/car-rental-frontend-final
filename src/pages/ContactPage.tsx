import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BRAND } from '../constants/theme';
import { RENTAL_LOCATIONS } from '../constants/locations';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsApp = () => {
    const text = 'Hello Oceane Car Rental, I would like to make an inquiry about car rental in Mauritius.';
    window.open(`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* 1. Header */}
      <div className="max-w-2xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
          Customer Concierge
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#16324F] tracking-tight">
          Get in Touch With Our Team
        </h1>
        <p className="text-sm sm:text-base text-[#66747E] leading-relaxed">
          Have a question about vehicle availability, special airport delivery, or long-term rentals? Our island support team is available 7 days a week.
        </p>
      </div>

      {/* 2. Contact Details & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Channels */}
          <div className="space-y-3">
            {/* Phone */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2F6F6D]/10 text-[#2F6F6D] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Call Us Directly
                </span>
                <p className="font-display font-bold text-base text-[#16324F]">
                  {BRAND.phone}
                </p>
                <p className="text-xs text-[#66747E]">Local & international calls welcome</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4F7D61]/10 text-[#4F7D61] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                    Instant WhatsApp Support
                  </span>
                  <p className="font-display font-bold text-base text-[#16324F]">
                    +{BRAND.whatsappNumber}
                  </p>
                  <p className="text-xs text-[#66747E]">Typical response time: under 15 mins</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="self-center px-3 py-1.5 bg-[#2F6F6D] text-white rounded-lg text-xs font-semibold hover:bg-[#255755] cursor-pointer"
              >
                Chat
              </button>
            </div>

            {/* Email */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#16324F]/10 text-[#16324F] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Email Inquiries
                </span>
                <p className="font-display font-bold text-base text-[#16324F]">
                  {BRAND.email}
                </p>
                <p className="text-xs text-[#66747E]">For custom bookings & corporate quotes</p>
              </div>
            </div>

            {/* Office & Hours */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D97745]/10 text-[#D97745] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Operating Hours
                </span>
                <p className="font-display font-bold text-sm text-[#16324F]">
                  Monday – Sunday: 07:00 – 21:00
                </p>
                <p className="text-xs text-[#66747E]">
                  SSR Airport Handover available 24/7 for tracked flights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6EC] shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#4F7D61]/10 text-[#4F7D61] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#16324F]">
                Thank you! Message Received
              </h3>
              <p className="text-sm text-[#66747E] max-w-md mx-auto">
                One of our fleet concierge specialists will review your inquiry and get back to you within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[#2F6F6D] hover:underline pt-2 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                Send Us a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm focus:ring-2 focus:ring-[#2F6F6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah@example.com"
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm focus:ring-2 focus:ring-[#2F6F6D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+230 ... or international"
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm focus:ring-2 focus:ring-[#2F6F6D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2F6F6D]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Long Term Rental">Long-Term Rental (14+ days)</option>
                    <option value="Airport Pickup">Airport Flight Coordination</option>
                    <option value="Corporate Booking">Corporate / Event Hire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                  Your Message or Travel Dates *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist your trip to Mauritius?"
                  className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm focus:ring-2 focus:ring-[#2F6F6D] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Mauritius Locations Map & Hubs Visualizer */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#DFE6EC] shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
            Island Handover Hubs
          </span>
          <h3 className="font-display font-bold text-xl text-[#16324F]">
            Where You Can Pick Up & Drop Off Your Car
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RENTAL_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-[#16324F]">
                  {loc.name}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#2F6F6D] border border-[#DFE6EC]">
                  {loc.pickupFee === 0 ? 'Free' : `+Rs ${loc.pickupFee}`}
                </span>
              </div>
              <p className="text-xs text-[#66747E] leading-relaxed">
                {loc.address}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
