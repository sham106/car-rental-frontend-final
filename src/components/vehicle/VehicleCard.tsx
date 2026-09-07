import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Fuel, Cog, Wind, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { useSearch } from '../../context/SearchContext';
import { vehicleService } from '../../services/vehicleService';

interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, priority = false }) => {
  const { pickupDate, returnDate, rentalDays } = useSearch();
  const [availability, setAvailability] = useState<{ isAvailable: boolean; reason?: string } | null>(null);
  const [checking, setChecking] = useState(false);

  // Check date-specific availability if dates are chosen
  useEffect(() => {
    let isMounted = true;
    if (pickupDate && returnDate) {
      setChecking(true);
      vehicleService.checkVehicleAvailability(vehicle.id, pickupDate, returnDate).then((res) => {
        if (isMounted) {
          setAvailability(res);
          setChecking(false);
        }
      });
    } else {
      setAvailability(null);
    }
    return () => {
      isMounted = false;
    };
  }, [vehicle.id, pickupDate, returnDate]);

  const estimatedTotal = vehicle.dailyRate * rentalDays;

  return (
    <div
      id={`vehicle-card-${vehicle.slug}`}
      className="group bg-white rounded-2xl border border-[#DFE6EC] hover:border-[#CAD5DF] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Photo Stage */}
      <div className="relative aspect-[16/10] bg-[#EAF0F3] overflow-hidden">
        <img
          src={vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge Top-Left */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#16324F]/90 text-white backdrop-blur-sm shadow-sm">
            {vehicle.category}
          </span>
        </div>

        {/* Availability Badge Top-Right */}
        <div className="absolute top-3 right-3">
          {vehicle.operationalStatus === 'in_service' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C88A32]/90 text-white backdrop-blur-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Workshop Check</span>
            </span>
          ) : availability && !availability.isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#B9534F]/90 text-white backdrop-blur-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Booked on Dates</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4F7D61]/90 text-white backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Available</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-lg text-[#16324F] group-hover:text-[#2F6F6D] transition-colors leading-tight">
              {vehicle.brand} {vehicle.model}
            </h3>
            <span className="text-xs text-[#66747E] font-medium">{vehicle.year}</span>
          </div>

          <p className="text-xs text-[#66747E] line-clamp-1 mb-4">
            {vehicle.color} · {vehicle.description}
          </p>

          {/* Specifications Matrix */}
          <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#EAF0F3] text-[#24313A]">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#F8F6F1] text-center">
              <Cog className="w-4 h-4 text-[#2F6F6D] mb-1" />
              <span className="text-[11px] font-semibold truncate max-w-full">
                {vehicle.transmission === 'Automatic' ? 'Auto' : 'Manual'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#F8F6F1] text-center">
              <Fuel className="w-4 h-4 text-[#2F6F6D] mb-1" />
              <span className="text-[11px] font-semibold truncate max-w-full">
                {vehicle.fuelType}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#F8F6F1] text-center">
              <Users className="w-4 h-4 text-[#2F6F6D] mb-1" />
              <span className="text-[11px] font-semibold">
                {vehicle.seats} Seats
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#F8F6F1] text-center">
              <Briefcase className="w-4 h-4 text-[#2F6F6D] mb-1" />
              <span className="text-[11px] font-semibold">
                {vehicle.luggageCapacity} Bags
              </span>
            </div>
          </div>
        </div>

        {/* Price & CTA Row */}
        <div className="pt-4 mt-2 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-[#66747E] font-medium">From</span>
              <span className="font-display font-extrabold text-xl text-[#16324F] tabular-nums">
                Rs {vehicle.dailyRate.toLocaleString()}
              </span>
              <span className="text-xs text-[#66747E]">/day</span>
            </div>
            {rentalDays > 1 && (
              <span className="text-[11px] text-[#2F6F6D] font-medium block tabular-nums">
                ~Rs {estimatedTotal.toLocaleString()} for {rentalDays} days
              </span>
            )}
          </div>

          <Link
            to={`/vehicle/${vehicle.slug}`}
            id={`btn-view-${vehicle.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16324F] group-hover:bg-[#2F6F6D] text-white font-semibold text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F6F6D]"
          >
            <span>View Vehicle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
