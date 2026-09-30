import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { MOCK_RENTAL_TERMS } from '../mocks/terms';
import { Link } from 'react-router-dom';

export const RentalTermsPage: React.FC = () => {
  return (
    <div id="rental-terms-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* 1. Header */}
      <div className="space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
          Transparency & Governance
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#16324F] tracking-tight">
          Rental Terms & Conditions
        </h1>
        <p className="text-sm sm:text-base text-[#66747E] leading-relaxed">
          At DailyCar, we believe in fair, clearly documented terms. Here is an explicit overview of driving rules, insurance excess, security deposits, and cancellation policies in Mauritius.
        </p>
      </div>

      {/* 2. Key Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#DFE6EC] shadow-xs">
        <div className="space-y-1">
          <span className="text-xs text-[#66747E] font-medium block">Minimum Age</span>
          <p className="font-display font-bold text-lg text-[#16324F]">20 - 25 Years</p>
          <p className="text-[11px] text-[#66747E]">Category calibrated thresholds</p>
        </div>
        <div className="space-y-1 sm:border-l sm:border-[#DFE6EC] sm:pl-6">
          <span className="text-xs text-[#66747E] font-medium block">Fuel Policy</span>
          <p className="font-display font-bold text-lg text-[#16324F]">Same-to-Same</p>
          <p className="text-[11px] text-[#66747E]">Return with same level as pickup</p>
        </div>
        <div className="space-y-1 sm:border-l sm:border-[#DFE6EC] sm:pl-6">
          <span className="text-xs text-[#66747E] font-medium block">Cancellation</span>
          <p className="font-display font-bold text-lg text-[#16324F]">Free up to 48h</p>
          <p className="text-[11px] text-[#66747E]">Zero penalty before scheduled delivery</p>
        </div>
      </div>

      {/* 3. Detailed Sections */}
      <div className="space-y-6">
        {MOCK_RENTAL_TERMS.map((term, index) => (
          <div
            key={term.id}
            id={`term-${term.id}`}
            className="bg-white p-6 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-[#EAF0F3] text-[#2F6F6D] font-bold text-xs flex items-center justify-center">
                {index + 1}
              </span>
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                {term.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#24313A] leading-relaxed pl-10">
              {term.summary}
            </p>
            {term.details && term.details.length > 0 && (
              <ul className="space-y-2 pl-10 pt-1">
                {term.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2 text-xs text-[#66747E] leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] mt-1.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* 4. Bottom Support Callout */}
      <div className="p-6 rounded-2xl bg-[#EAF0F3] border border-[#DFE6EC] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-sm text-[#16324F]">
            Need a special exemption or corporate rental contract?
          </h4>
          <p className="text-xs text-[#66747E]">
            Contact our operations manager for customized fleet agreements.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#16324F] hover:bg-[#2F6F6D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Contact Operations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
