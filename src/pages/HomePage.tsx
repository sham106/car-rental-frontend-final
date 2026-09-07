import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Star,
  Layers,
  CalendarCheck,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { QuickSearch } from '../components/search/QuickSearch';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { VehicleCardSkeleton } from '../components/common/SkeletonLoader';
import { vehicleService } from '../services/vehicleService';
import { categoryService } from '../services/categoryService';
import { Vehicle, VehicleCategory } from '../types/vehicle';
import { MOCK_TESTIMONIALS } from '../mocks/testimonials';
import { BRAND } from '../constants/theme';

export const HomePage: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [fleetVersion, setFleetVersion] = useState(0);

  useEffect(() => {
    const onFleetUpdate = () => setFleetVersion((v) => v + 1);
    window.addEventListener('oceane_fleet_updated', onFleetUpdate);
    return () => window.removeEventListener('oceane_fleet_updated', onFleetUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      vehicleService.getFeaturedVehicles(),
      categoryService.getCategories(),
    ]).then(([vehicles, cats]) => {
      if (isMounted) {
        setFeaturedVehicles(vehicles);
        setCategories(cats);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fleetVersion]);

  return (
    <div id="home-page" className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO COMPOSITION */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20 lg:pb-24">
        {/* Subtle decorative geometric background pattern */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#2F6F6D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -z-10 w-80 h-80 bg-[#D97745]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0F3] border border-[#DFE6EC] text-[#2F6F6D] text-xs font-semibold">
                <Compass className="w-4 h-4 text-[#D97745]" />
                <span>Premier Coastal Car Rental in Mauritius</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#16324F] tracking-tight leading-[1.1]">
                Drive Mauritius <br />
                <span className="text-[#2F6F6D]">Your Way.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#66747E] leading-relaxed max-w-xl">
                Experience the freedom of Mauritius with verified modern vehicles, 100% transparent pricing, and personalized flight meet-and-greet at SSR Airport.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <Link
                  to="/fleet"
                  id="hero-find-car-btn"
                  className="inline-flex items-center gap-2 bg-[#D97745] hover:bg-[#c26534] text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Car className="w-5 h-5" />
                  <span>Find a Car</span>
                </Link>

                <Link
                  to="/fleet"
                  id="hero-browse-fleet-btn"
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#EAF0F3] text-[#16324F] border border-[#CAD5DF] px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all"
                >
                  <span>Browse Fleet</span>
                  <ArrowRight className="w-4 h-4 text-[#2F6F6D]" />
                </Link>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#DFE6EC] text-xs text-[#24313A]">
                <div>
                  <span className="font-display font-bold text-sm sm:text-base text-[#16324F] block">
                    Zero Hidden Fees
                  </span>
                  <span className="text-[#66747E] text-[11px]">Clear rental contracts</span>
                </div>
                <div>
                  <span className="font-display font-bold text-sm sm:text-base text-[#16324F] block">
                    Free Airport Delivery
                  </span>
                  <span className="text-[#66747E] text-[11px]">SSR Terminal P2 meet</span>
                </div>
                <div>
                  <span className="font-display font-bold text-sm sm:text-base text-[#16324F] block">
                    Unlimited Mileage
                  </span>
                  <span className="text-[#66747E] text-[11px]">Island-wide freedom</span>
                </div>
              </div>
            </div>

            {/* Right Automotive Photography Composition */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85"
                  alt="Toyota RAV4 driving through coastal landscape in Mauritius"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16324F]/80 via-transparent to-transparent" />
                
                {/* Embedded Vehicle Spotlight Tag */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6F6D]">
                      Featured Island Cruiser
                    </span>
                    <h4 className="font-display font-bold text-base text-[#16324F]">
                      Toyota RAV4 Hybrid AWD
                    </h4>
                    <p className="text-xs text-[#66747E]">
                      Automatic · Hybrid · Elevated Clearance
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#66747E]">From</span>
                    <span className="font-display font-bold text-lg text-[#16324F] block tabular-nums">
                      Rs 2,800<span className="text-xs font-normal">/day</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK SEARCH PANEL */}
          <div className="mt-8 sm:mt-12 lg:mt-14">
            <QuickSearch />
          </div>
        </div>
      </section>

      {/* 2. FLEET CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          categoryTitle="Tailored To Your Journey"
          title="Explore Vehicle Categories"
          description="From agile city hatchbacks for narrow village lanes to rugged all-wheel drive SUVs for southern peaks."
          actionText="View Full Fleet"
          actionHref="/fleet"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/fleet?category=${cat.slug}`}
              id={`cat-card-${cat.slug}`}
              className="group bg-white rounded-2xl border border-[#DFE6EC] hover:border-[#2F6F6D] p-3 sm:p-4 text-center transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="aspect-[4/3] rounded-xl bg-[#EAF0F3] overflow-hidden mb-3">
                <img
                  src={cat.representativePhoto}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-[#16324F] group-hover:text-[#2F6F6D] transition-colors mb-0.5">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#66747E] font-medium">
                  {cat.vehicleCount} Vehicles
                </p>
                <span className="text-[11px] font-semibold text-[#D97745] block mt-1.5">
                  From Rs {cat.startingDailyRate.toLocaleString()}/d
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED VEHICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          categoryTitle="Hand-Picked Selection"
          title="Featured Rental Vehicles"
          description="Popular choices across Mauritius with exceptional maintenance records, fuel efficiency, and comfort."
          actionText="See All Available Vehicles"
          actionHref="/fleet"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.slice(0, 6).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY CHOOSE US (Authentic Customer Benefits) */}
      <section className="bg-[#EAF0F3] py-16 sm:py-20 border-y border-[#DFE6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            categoryTitle="The Oceane Standard"
            title="Why Rent With Oceane"
            description="Clear expectations, reliable mechanics, and direct local support so your island holiday remains effortlessly smooth."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2F6F6D]/10 text-[#2F6F6D] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                Well-Maintained Fleet
              </h3>
              <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
                All vehicles undergo strict 40-point safety audits before every handover, including full tyre depth and tropical AC performance checks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2F6F6D]/10 text-[#2F6F6D] flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                Clear Rental Terms
              </h3>
              <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
                Fair same-to-same fuel policy, standard CDW insurance with documented low deductible excess, and zero hidden credit card processing surcharges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2F6F6D]/10 text-[#2F6F6D] flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                Flexible Vehicle Choices
              </h3>
              <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
                Economical hatchbacks for quiet coves, spacious saloons for luggage, and versatile 7 to 10 seaters for extended family retreats.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2F6F6D]/10 text-[#2F6F6D] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#16324F]">
                Responsive Local Support
              </h3>
              <p className="text-xs sm:text-sm text-[#66747E] leading-relaxed">
                Direct WhatsApp contact with our island dispatch team from flight touchdown to departure, with 24/7 breakdown assistance island-wide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (Without generic SaaS template 01/02 numbering) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          categoryTitle="Simple & Transparent"
          title="How Rental Works With Oceane"
          description="From selecting your vehicle online to picking up your keys at the airport or your hotel villa."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center">
              <Car className="w-5 h-5 text-[#D97745]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#16324F]">
                Choose Vehicle
              </h4>
              <p className="text-xs text-[#66747E] mt-1 leading-relaxed">
                Browse our real fleet with genuine photos and transparent daily pricing.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[#D97745]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#16324F]">
                Select Dates
              </h4>
              <p className="text-xs text-[#66747E] mt-1 leading-relaxed">
                Enter your travel dates and choose convenient airport or hotel delivery.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D97745]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#16324F]">
                Send Request
              </h4>
              <p className="text-xs text-[#66747E] mt-1 leading-relaxed">
                Submit customer details with zero upfront credit card payments.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#D97745]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#16324F]">
                Get Confirmation
              </h4>
              <p className="text-xs text-[#66747E] mt-1 leading-relaxed">
                Our operations team verifies schedule and sends your formal voucher.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#16324F] text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#D97745]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#16324F]">
                Pick Up & Drive
              </h4>
              <p className="text-xs text-[#66747E] mt-1 leading-relaxed">
                Meet our representative at Arrivals or your resort, inspect and explore!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          categoryTitle="Customer Experiences"
          title="Recent Traveler Reviews"
          description="Honest feedback from international visitors who explored Mauritius with Oceane vehicles."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DFE6EC] shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#C88A32]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C88A32]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#24313A] italic leading-relaxed">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#DFE6EC] space-y-0.5">
                <p className="font-display font-bold text-sm text-[#16324F]">
                  {t.customerName}
                </p>
                <p className="text-[11px] text-[#66747E]">
                  {t.location} · <span className="font-medium text-[#2F6F6D]">{t.vehicleRented}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PRE-FOOTER INQUIRY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16324F] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#D97745]">
              Ready for Mauritius?
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Reserve Your Car in Advance for the Best Rates
            </h3>
            <p className="text-sm text-[#EAF0F3]/80 leading-relaxed">
              No deposit required to submit a booking enquiry. Free cancellation up to 48 hours before pickup.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              to="/fleet"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Car className="w-4 h-4" />
              <span>Browse Fleet</span>
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              <span>Contact Concierge</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
