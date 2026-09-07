import React from 'react';
import { Cog, Fuel, Users, Briefcase, DoorClosed, Wind, Gauge, ShieldAlert, Sparkles } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';

interface VehicleSpecsProps {
  vehicle: Vehicle;
}

export const VehicleSpecs: React.FC<VehicleSpecsProps> = ({ vehicle }) => {
  const specs = [
    {
      label: 'Transmission',
      value: vehicle.transmission,
      icon: Cog,
      detail: 'Electronic Shift Control',
    },
    {
      label: 'Fuel Type',
      value: vehicle.fuelType,
      icon: Fuel,
      detail: vehicle.fuelConsumption || 'High Efficiency',
    },
    {
      label: 'Seating Capacity',
      value: `${vehicle.seats} Passengers`,
      icon: Users,
      detail: 'Ergonomic contours',
    },
    {
      label: 'Luggage Storage',
      value: `${vehicle.luggageCapacity} Large Suitcases`,
      icon: Briefcase,
      detail: 'Expandable trunk bay',
    },
    {
      label: 'Doors',
      value: `${vehicle.doors} Doors`,
      icon: DoorClosed,
      detail: 'Child-lock equipped',
    },
    {
      label: 'Air Conditioning',
      value: vehicle.airConditioning ? 'Climate Control' : 'Standard Ventilation',
      icon: Wind,
      detail: 'Tropical spec cooling',
    },
    {
      label: 'Engine Power',
      value: vehicle.engineCapacity || 'High Efficiency Engine',
      icon: Gauge,
      detail: 'Island certified tune',
    },
    {
      label: 'Driver Minimum Age',
      value: `${vehicle.minimumDriverAge || 21}+ Years Old`,
      icon: ShieldAlert,
      detail: '1 year driving licence',
    },
  ];

  return (
    <div id="vehicle-specs-matrix" className="space-y-4">
      <h3 className="font-display font-bold text-lg text-[#16324F]">
        Vehicle Specifications
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-[#DFE6EC] flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#66747E]">
                  {item.label}
                </span>
                <Icon className="w-4 h-4 text-[#2F6F6D]" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-[#16324F]">
                  {item.value}
                </p>
                <p className="text-[11px] text-[#66747E] mt-0.5">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features & Equipment List */}
      {vehicle.features && vehicle.features.length > 0 && (
        <div className="pt-3">
          <h4 className="font-display font-bold text-sm text-[#16324F] mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D97745]" />
            <span>Included Amenities & Features</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vehicle.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#24313A] py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D]" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
