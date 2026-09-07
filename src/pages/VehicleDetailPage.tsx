import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Share2, 
  Phone, 
  Sparkles,
  Car
} from 'lucide-react';
import { VehicleGallery } from '../components/vehicle/VehicleGallery';
import { VehicleSpecs } from '../components/vehicle/VehicleSpecs';
import { PriceBreakdownBox } from '../components/vehicle/PriceBreakdownBox';
import { VehicleAvailabilityCalendar } from '../components/vehicle/VehicleAvailabilityCalendar';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle';
import { useSearch } from '../context/SearchContext';
import { BRAND } from '../constants/theme';

export const VehicleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { pickupDate, returnDate, rentalDays, setPickupDate, setReturnDate } = useSearch();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fleetVersion, setFleetVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setFleetVersion((v) => v + 1);
    window.addEventListener('oceane_fleet_updated', handleUpdate);
    return () => window.removeEventListener('oceane_fleet_updated', handleUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      setLoading(true);
      vehicleService.getVehicleBySlug(slug).then((found) => {
        if (isMounted) {
          setVehicle(found);
          if (found) {
            vehicleService.getSimilarVehicles(found.id, found.category).then((sim) => {
              if (isMounted) setSimilarVehicles(sim);
            });
          }
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [slug, fleetVersion]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle?.brand} ${vehicle?.model} - Oceane Car Rental`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-[#EAF0F3] w-32 rounded" />
          <div className="h-10 bg-[#EAF0F3] w-2/3 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 h-96 bg-[#EAF0F3] rounded-2xl" />
            <div className="lg:col-span-4 h-96 bg-[#EAF0F3] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF0F3] text-[#2F6F6D] flex items-center justify-center mx-auto">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#16324F]">Vehicle Not Found</h2>
        <p className="text-sm text-[#66747E]">
          The vehicle you are looking for may have been retired or is currently not published.
        </p>
        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#16324F] text-white rounded-xl font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Fleet Catalog</span>
        </Link>
      </div>
    );
  }

  const estimatedTotal = vehicle.dailyRate * rentalDays;

  return (
    <div id="vehicle-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex items-center justify-between gap-4 text-xs text-[#66747E]">
        <Link
          to="/fleet"
          className="inline-flex items-center gap-1.5 font-semibold text-[#16324F] hover:text-[#2F6F6D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 font-semibold text-[#66747E] hover:text-[#16324F] transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#2F6F6D]" />
          <span>{copied ? 'Link Copied!' : 'Share Vehicle'}</span>
        </button>
      </div>

      {/* 2. Main Title Banner */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16324F] text-white">
            {vehicle.category}
          </span>
          <span className="text-xs text-[#66747E] font-medium">
            Model Year {vehicle.year}
          </span>
          <span className="text-xs text-[#66747E]">·</span>
          <span className="text-xs text-[#66747E] font-medium">
            Color: {vehicle.color}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#16324F] tracking-tight">
          {vehicle.brand} {vehicle.model}
        </h1>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery & Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery */}
          <VehicleGallery photos={vehicle.photos} vehicleTitle={`${vehicle.brand} ${vehicle.model}`} />

          {/* Description */}
          <div className="bg-white rounded-2xl border border-[#DFE6EC] p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-lg text-[#16324F]">
              About This Vehicle
            </h3>
            <p className="text-sm sm:text-base text-[#24313A] leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          {/* Technical Specs Matrix & Amenities */}
          <VehicleSpecs vehicle={vehicle} />

          {/* Live Fleet Availability & Booked Dates Calendar */}
          <section id="availability-calendar-section" className="scroll-mt-24 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-[#16324F] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2F6F6D]" />
                  <span>Real-Time Availability & Booked Dates</span>
                </h3>
                <p className="text-xs text-[#66747E] mt-0.5">
                  Dates highlighted in red are already booked. Click any open dates on the calendar to update your rental reservation.
                </p>
              </div>
            </div>

            <VehicleAvailabilityCalendar
              vehicleId={vehicle.id}
              vehicleName={`${vehicle.brand} ${vehicle.model}`}
              pickupDate={pickupDate}
              returnDate={returnDate}
              onSelectRange={(pickup, ret) => {
                if (pickup) setPickupDate(pickup);
                if (ret) setReturnDate(ret);
              }}
            />
          </section>

          {/* Rental Inclusions Checklist */}
          <div className="bg-[#EAF0F3] rounded-2xl p-5 sm:p-6 border border-[#DFE6EC] space-y-3">
            <h4 className="font-display font-bold text-base text-[#16324F] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F6F6D]" />
              <span>Standard Rental Inclusions with Every Booking</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#24313A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>Unlimited Island-wide Kilometers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>Third-Party & Collision Damage Waiver (CDW)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>24/7 Island Breakdown Assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>SSR Airport Terminal Delivery & Meet-and-Greet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>Free Additional Authorized Driver</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />
                <span>Fair Same-to-Same Fuel Policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar: Pricing & Availability Box */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <PriceBreakdownBox vehicle={vehicle} />
        </aside>
      </div>

      {/* 4. Similar Vehicles Section */}
      {similarVehicles.length > 0 && (
        <section className="pt-12 border-t border-[#DFE6EC] space-y-6">
          <SectionHeader
            categoryTitle="Compare Similar Options"
            title={`Other ${vehicle.category.toUpperCase()} Vehicles`}
            description="Explore alternative models in the same category available for rent."
            actionText="View All Vehicles"
            actionHref="/fleet"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#DFE6EC] p-3 shadow-lg z-30 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#66747E] uppercase font-bold block">
            {rentalDays} {rentalDays === 1 ? 'day' : 'days'} rental
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold text-lg text-[#16324F] tabular-nums">
              Rs {estimatedTotal.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#66747E]">
              (Rs {vehicle.dailyRate}/d)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/book?vehicleId=${vehicle.id}`)}
          className="bg-[#D97745] hover:bg-[#c26534] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <span>Request Vehicle</span>
        </button>
      </div>
    </div>
  );
};
