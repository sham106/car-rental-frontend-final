import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Phone, Mail, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../../constants/theme';
import { useLocations } from '../../hooks/useLocations';

export const Footer: React.FC = () => {
  const RENTAL_LOCATIONS = useLocations();
  return (
    <footer id="site-footer" className="bg-[#16324F] text-[#EAF0F3] pt-16 pb-12 border-t border-[#20456d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#2F6F6D] flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-[#F8F6F1]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-white leading-none">
                  DailyCar
                </span>
                <span className="text-[11px] font-medium tracking-widest text-[#EAF0F3]/80 uppercase mt-0.5">
                  Car Rental Mauritius
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#EAF0F3]/80 max-w-sm leading-relaxed">
              Premium coastal mobility across Mauritius. Honest transparent rates, verified clean vehicles, and 24/7 dedicated flight meet-and-greet at SSR International Airport.
            </p>

            <div className="pt-2 flex flex-col space-y-2.5 text-xs text-[#EAF0F3]/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D97745] flex-shrink-0 mt-0.5" />
                <span>{BRAND.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D97745] flex-shrink-0" />
                <span>{BRAND.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2F6F6D] flex-shrink-0" />
                <a href={`tel:${BRAND.phone}`} className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  {BRAND.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2F6F6D] flex-shrink-0" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  {BRAND.email}
                </a>
              </div>
            </div>
          </div>

          {/* Fleet Categories */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Fleet Categories
            </h4>
            <ul className="space-y-2 text-sm text-[#EAF0F3]/80">
              <li>
                <Link to="/fleet?category=economy" className="hover:text-white transition-colors">
                  Economy Hatchbacks
                </Link>
              </li>
              <li>
                <Link to="/fleet?category=compact" className="hover:text-white transition-colors">
                  Compact Sedans
                </Link>
              </li>
              <li>
                <Link to="/fleet?category=sedan" className="hover:text-white transition-colors">
                  Family Sedans
                </Link>
              </li>
              <li>
                <Link to="/fleet?category=suv" className="hover:text-white transition-colors">
                  SUVs & All-Wheel Drives
                </Link>
              </li>
              <li>
                <Link to="/fleet?category=premium" className="hover:text-white transition-colors">
                  Premium Executive
                </Link>
              </li>
              <li>
                <Link to="/fleet?category=van" className="hover:text-white transition-colors">
                  7 to 10-Seater Vans
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Policies */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Rental Info & Terms
            </h4>
            <ul className="space-y-2 text-sm text-[#EAF0F3]/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Our Fleet
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQs & Documents Required
                </Link>
              </li>
              <li>
                <Link to="/rental-terms" className="hover:text-white transition-colors">
                  Rental Policies & Excess
                </Link>
              </li>
              <li>
                <Link to="/rental-terms#term-fuel-policy" className="hover:text-white transition-colors">
                  Same-to-Same Fuel Policy
                </Link>
              </li>
              <li>
                <Link to="/rental-terms#term-mileage-limits" className="hover:text-white transition-colors">
                  Unlimited Island Mileage
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Concierge Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Pickups */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">
              Pickup Hubs
            </h4>
            <ul className="space-y-2 text-xs text-[#EAF0F3]/80">
              {RENTAL_LOCATIONS.slice(0, 5).map((loc) => (
                <li key={loc.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D]" />
                  <span>{loc.name}</span>
                </li>
              ))}
              <li className="pt-2">
                <span className="inline-block px-2.5 py-1 bg-[#2F6F6D]/40 text-white rounded text-[11px] font-medium">
                  Free Airport Terminal Delivery
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#EAF0F3]/60">
          <p>© {new Date().getFullYear()} {BRAND.legalName} ({BRAND.registrationNumber}). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#EAF0F3]/80">
              <ShieldCheck className="w-4 h-4 text-[#2F6F6D]" />
              <span>Licensed Mauritian Operator</span>
            </span>
            <span className="tabular-nums">Currency: Mauritian Rupee (MUR Rs)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
