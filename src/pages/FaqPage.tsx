import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { MOCK_FAQS } from '../mocks/faqs';
import { BRAND } from '../constants/theme';

export const FaqPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>('faq-1');

  const categories = useMemo(() => {
    const cats = new Set(MOCK_FAQS.map((f) => f.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredFaqs = useMemo(() => {
    return MOCK_FAQS.filter((faq) => {
      const matchCat = activeCategory === 'All' || faq.category === activeCategory;
      const matchSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const handleWhatsApp = () => {
    const text = 'Hello Oceane Car Rental, I have a question regarding car rental in Mauritius.';
    window.open(`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="faq-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
          Help & Guidance
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#16324F] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[#66747E] max-w-xl mx-auto leading-relaxed">
          Everything you need to know about renting a car in Mauritius, driving licenses, fuel policies, and airport collection.
        </p>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-[#66747E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g., licence, deposit, fuel)..."
            className="w-full pl-9 pr-4 py-3 bg-white border border-[#CAD5DF] rounded-xl text-xs sm:text-sm text-[#24313A] shadow-xs focus:ring-2 focus:ring-[#2F6F6D]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#16324F] text-white shadow-xs'
                  : 'bg-white text-[#66747E] border border-[#DFE6EC] hover:bg-[#F8F6F1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#DFE6EC] text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#66747E] mx-auto" />
            <h3 className="font-display font-bold text-base text-[#16324F]">No matching questions found</h3>
            <p className="text-xs text-[#66747E]">
              Try searching with different terms or reach out to our WhatsApp concierge.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIndex === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-[#DFE6EC] overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8F6F1]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6F6D]">
                      {faq.category}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#16324F] leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-[#EAF0F3] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#16324F] text-white' : 'text-[#16324F]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#66747E] leading-relaxed border-t border-[#EAF0F3]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. WhatsApp Help CTA */}
      <div className="bg-[#16324F] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-lg">Still have a question?</h3>
          <p className="text-xs text-[#EAF0F3]/80">
            Our local Mauritian concierge team is happy to assist with any trip planning query.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="inline-flex items-center gap-2 bg-[#2F6F6D] hover:bg-[#255755] text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors flex-shrink-0 cursor-pointer shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
