import React from 'react';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#DFE6EC] shadow-xs overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-[#EAF0F3]" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-[#EAF0F3] rounded w-2/3" />
          <div className="h-4 bg-[#EAF0F3] rounded w-12" />
        </div>
        <div className="h-3 bg-[#EAF0F3] rounded w-full" />
        <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#EAF0F3]">
          <div className="h-10 bg-[#EAF0F3] rounded-lg" />
          <div className="h-10 bg-[#EAF0F3] rounded-lg" />
          <div className="h-10 bg-[#EAF0F3] rounded-lg" />
          <div className="h-10 bg-[#EAF0F3] rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-[#EAF0F3] rounded w-24" />
          <div className="h-8 bg-[#EAF0F3] rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
};

export const FleetGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
};
