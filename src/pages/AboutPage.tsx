import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Users, 
  HeartHandshake, 
  Award, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';

export const AboutPage: React.FC = () => {
  return (
    <div id="about-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* 1. Hero Overview */}
      <section className="space-y-6 max-w-3xl">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
          Our Journey & Values
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#16324F] tracking-tight leading-tight">
          Built on Trust, Island Hospitality, and Automotive Confidence.
        </h1>
        <p className="text-base sm:text-lg text-[#66747E] leading-relaxed">
          Founded in Mauritius, DailyCar was created to eliminate the friction, hidden fees, and uncertainty that often surround holiday car hire. We believe discovering this island should be effortless from the minute you step off your plane.
        </p>
      </section>

      {/* 2. Visual Storytelling Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="Mauritius turquoise coast"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D97745]">
            Our Story
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#16324F]">
            From Local Roots to Seamless Mobility
          </h2>
          <p className="text-sm sm:text-base text-[#66747E] leading-relaxed">
            What started as a boutique fleet of four sedans has grown into one of Mauritius's most dependable independent rental agencies. We deliberately chose not to operate like faceless multinational franchises; instead, our team personally meets you at SSR Airport or drops off your keys right at your villa doorstep.
          </p>
          <p className="text-sm sm:text-base text-[#66747E] leading-relaxed">
            Every vehicle in our catalog is owned, insured, inspected, and maintained by certified technicians. When you speak to our concierge on WhatsApp, you are speaking directly to local dispatchers who know the roads, mountain passes, and coastal weather conditions intimately.
          </p>
        </div>
      </section>

      {/* 3. Fleet Philosophy & Pillars */}
      <section className="space-y-8">
        <SectionHeader
          categoryTitle="How We Operate"
          title="Our Fleet Philosophy"
          description="We take vehicle quality and safety seriously, holding our cars to the highest operational benchmarks."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#16324F] text-[#D97745] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#16324F]">
              40-Point Pre-Rental Inspection
            </h3>
            <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
              Tyres, brake pads, steering fluid, electrical systems, and tropical air conditioning units are verified and logged before any customer handover.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#2F6F6D] text-white flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#16324F]">
              Genuine Modern Fleet
            </h3>
            <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
              We exclusively acquire recent-year models with modern active safety electronics, ISOFIX child seat latches, and high fuel economy standards.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#D97745] text-white flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#16324F]">
              Radical Transparency
            </h3>
            <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
              No tricky wording, no mandatory surprise upsells at the counter, and no sudden deduction charges for customary holiday road dust.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Island Service Area */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DFE6EC] shadow-sm space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F6F6D]">
            Island Coverage
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#16324F]">
            Serving Every Corner of Mauritius
          </h2>
          <p className="text-sm text-[#66747E]">
            Our fleet delivery service covers all major tourist regions, transport hubs, and private accommodations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-semibold text-[#16324F]">
          <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-1">
            <MapPin className="w-4 h-4 text-[#D97745]" />
            <p className="font-bold text-sm">SSR Airport Hub</p>
            <p className="text-[11px] text-[#66747E] font-normal">Terminal P2 free delivery</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-1">
            <MapPin className="w-4 h-4 text-[#2F6F6D]" />
            <p className="font-bold text-sm">North Region</p>
            <p className="text-[11px] text-[#66747E] font-normal">Grand Baie, Pereybere, Trou aux Biches</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-1">
            <MapPin className="w-4 h-4 text-[#2F6F6D]" />
            <p className="font-bold text-sm">West Coast</p>
            <p className="text-[11px] text-[#66747E] font-normal">Flic-en-Flac, Tamarin, Le Morne</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-1">
            <MapPin className="w-4 h-4 text-[#2F6F6D]" />
            <p className="font-bold text-sm">East Coast</p>
            <p className="text-[11px] text-[#66747E] font-normal">Belle Mare, Trou d'Eau Douce</p>
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="text-center space-y-4 pt-4">
        <h3 className="font-display font-bold text-2xl text-[#16324F]">
          Ready to discover Mauritius?
        </h3>
        <p className="text-sm text-[#66747E] max-w-lg mx-auto">
          Explore our available cars and book with zero upfront risk.
        </p>
        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#16324F] hover:bg-[#2F6F6D] text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <span>Browse Available Vehicles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
