import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Calendar, 
  MapPin, 
  ArrowUpDown,
  Car,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { FleetGridSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { vehicleService } from '../services/vehicleService';
import { categoryService } from '../services/categoryService';
import { Vehicle, VehicleCategory, TransmissionType, FuelType } from '../types/vehicle';
import { useSearch } from '../context/SearchContext';
import { useLocations } from '../hooks/useLocations';
import { isValidDateString } from '../utils/dateUtils';

export const FleetPage: React.FC = () => {
  const RENTAL_LOCATIONS = useLocations();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    pickupLocationId,
    returnLocationId,
    pickupDate,
    returnDate,
    rentalDays,
    isSameDay,
    setPickupDate,
    setReturnDate,
    setSearchParameters,
  } = useSearch();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<TransmissionType | 'all'>('all');
  const [selectedFuel, setSelectedFuel] = useState<FuelType | 'all'>('all');
  const [minSeats, setMinSeats] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'year_desc'>('recommended');
  const [onlyAvailableOnDates, setOnlyAvailableOnDates] = useState(false);
  const [fleetVersion, setFleetVersion] = useState(0);

  // Availability map for date-based filtering
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});

  // Sync category param if URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    const pickup = searchParams.get('pickupDate');
    const dropoff = searchParams.get('returnDate');
    const pickupLoc = searchParams.get('pickupLoc');
    const returnLoc = searchParams.get('returnLoc');
    setSearchParameters({
      pickupDate: pickup && isValidDateString(pickup) ? pickup : undefined,
      returnDate: dropoff && isValidDateString(dropoff) ? dropoff : undefined,
      pickupLocationId: RENTAL_LOCATIONS.some(l => l.id === pickupLoc) ? pickupLoc! : undefined,
      returnLocationId: RENTAL_LOCATIONS.some(l => l.id === returnLoc) ? returnLoc! : undefined,
    });
  }, [searchParams]);

  // Listen for admin fleet updates
  useEffect(() => {
    const onFleetUpdate = () => setFleetVersion((v) => v + 1);
    window.addEventListener('oceane_fleet_updated', onFleetUpdate);
    return () => window.removeEventListener('oceane_fleet_updated', onFleetUpdate);
  }, []);

  // Load initial vehicles and categories
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      vehicleService.getVehicles({
        search: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
        transmission: selectedTransmission,
        fuelType: selectedFuel,
        minSeats: minSeats > 0 ? minSeats : undefined,
        maxPrice: maxPrice,
        sortBy: sortBy,
      }),
      categoryService.getCategories(),
    ]).then(([vehList, catList]) => {
      if (isMounted) {
        setVehicles(vehList);
        setCategories(catList);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedBrand, selectedTransmission, selectedFuel, minSeats, maxPrice, sortBy, fleetVersion]);

  // Check availability for current vehicles against search dates
  useEffect(() => {
    let isMounted = true;
    setAvailabilityMap({});
    if (pickupDate && returnDate && vehicles.length > 0) {
      Promise.all(
        vehicles.map((v) =>
          vehicleService.checkVehicleAvailability(v.id, pickupDate, returnDate).then((res) => ({
            id: v.id,
            isAvailable: res.isAvailable,
          }))
        )
      ).then((results) => {
        if (isMounted) {
          const map: Record<string, boolean> = {};
          results.forEach((r) => {
            map[r.id] = r.isAvailable;
          });
          setAvailabilityMap(map);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [vehicles, pickupDate, returnDate]);

  // Distinct brands for filter options
  const availableBrands = useMemo(() => {
    const brands = new Set(vehicles.map((v) => v.brand));
    return Array.from(brands).sort();
  }, [vehicles]);

  // Filter list if user checks "Only show available on my dates"
  const displayedVehicles = useMemo(() => {
    if (!onlyAvailableOnDates) return vehicles;
    return vehicles.filter((v) => availabilityMap[v.id] === true);
  }, [vehicles, onlyAvailableOnDates, availabilityMap]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedTransmission('all');
    setSelectedFuel('all');
    setMinSeats(0);
    setMaxPrice(5000);
    setSortBy('recommended');
    setOnlyAvailableOnDates(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedTransmission !== 'all' ||
    selectedFuel !== 'all' ||
    minSeats > 0 ||
    maxPrice < 5000 ||
    onlyAvailableOnDates;

  const pickupLocationObj = RENTAL_LOCATIONS.find((l) => l.id === pickupLocationId);

  return (
    <div id="fleet-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Page Header & Active Dates Pill */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6F6D] mb-1 block">
              Fleet Discovery
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#16324F] tracking-tight">
              Our Rental Fleet
            </h1>
            <p className="text-sm text-[#66747E] mt-1">
              Browse our verified late-model fleet available across Mauritius.
            </p>
          </div>

          {/* Date & Location Summary Pill */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#DFE6EC] shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2F6F6D]" />
              <div>
                <span className="text-[#66747E] block text-[10px] uppercase font-bold">Selected Dates</span>
                <span className="font-semibold text-[#16324F]">
                  {isSameDay
                    ? `${pickupDate} (Same-Day Return • 1 Day)`
                    : `${pickupDate} → ${returnDate} (${rentalDays} ${rentalDays === 1 ? 'day' : 'days'})`}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#DFE6EC] hidden sm:block" />

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D97745]" />
              <div>
                <span className="text-[#66747E] block text-[10px] uppercase font-bold">Pickup Hub</span>
                <span className="font-semibold text-[#16324F] truncate max-w-[140px] block">
                  {pickupLocationObj?.name || 'Airport (MRU)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Search & Controls Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#DFE6EC] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#66747E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="fleet-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Toyota, SUV, automatic..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-xs sm:text-sm text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66747E] hover:text-[#24313A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sort By & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#66747E]" />
              <span className="text-[#66747E] font-medium hidden sm:inline">Sort by:</span>
              <select
                id="fleet-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl py-2 px-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D]"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Newest Year</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              id="btn-mobile-filter"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 bg-[#16324F] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Fleet Layout: Left Side Panel Filters + Right Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-[#DFE6EC] shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#EAF0F3] pb-3">
            <h3 className="font-display font-bold text-base text-[#16324F] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2F6F6D]" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#D97745] hover:text-[#c26534] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Date Availability Toggle */}
          <div className="p-3 bg-[#EAF0F3] rounded-xl text-xs space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailableOnDates}
                onChange={(e) => setOnlyAvailableOnDates(e.target.checked)}
                className="rounded text-[#2F6F6D] focus:ring-[#2F6F6D] w-4 h-4"
              />
              <span className="font-semibold text-[#16324F]">Only available on selected dates</span>
            </label>
            <p className="text-[11px] text-[#66747E] pl-6">
              Hides vehicles currently blocked by confirmed bookings or maintenance.
            </p>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#66747E] block">
              Vehicle Category
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#16324F] text-white'
                    : 'text-[#24313A] hover:bg-[#F8F6F1]'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] opacity-75">{vehicles.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                    selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                      ? 'bg-[#16324F] text-white'
                      : 'text-[#24313A] hover:bg-[#F8F6F1]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">{cat.vehicleCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#66747E] block">
              Transmission
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['all', 'Automatic', 'Manual'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTransmission(t)}
                  className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    selectedTransmission === t
                      ? 'bg-[#2F6F6D] text-white border-[#2F6F6D]'
                      : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC] hover:bg-white'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'Automatic' ? 'Auto' : 'Manual'}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#66747E] block">
              Fuel Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['all', 'Petrol', 'Diesel', 'Hybrid'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFuel(f)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    selectedFuel === f
                      ? 'bg-[#2F6F6D] text-white border-[#2F6F6D]'
                      : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC] hover:bg-white'
                  }`}
                >
                  {f === 'all' ? 'All Fuels' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Seating Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                Minimum Seats
              </span>
              <span className="font-semibold text-[#16324F]">
                {minSeats === 0 ? 'Any' : `${minSeats}+ Seats`}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 5, 7, 10].map((seats) => (
                <button
                  key={seats}
                  type="button"
                  onClick={() => setMinSeats(seats)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    minSeats === seats
                      ? 'bg-[#16324F] text-white border-[#16324F]'
                      : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC] hover:bg-white'
                  }`}
                >
                  {seats === 0 ? 'Any' : `${seats}`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                Max Daily Rate
              </span>
              <span className="font-display font-bold text-[#16324F]">
                Rs {maxPrice.toLocaleString()}/d
              </span>
            </div>
            <input
              type="range"
              min="1400"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#2F6F6D] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#66747E]">
              <span>Rs 1,400</span>
              <span>Rs 5,000+</span>
            </div>
          </div>
        </aside>

        {/* Right Vehicle Grid Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Result Count Strip */}
          <div className="flex items-center justify-between text-xs text-[#66747E] px-1">
            <span>
              Showing <strong className="text-[#16324F] font-bold">{displayedVehicles.length}</strong> vehicles
              {onlyAvailableOnDates && ' (filtered for your dates)'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[#D97745] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <FleetGridSkeleton count={6} />
          ) : displayedVehicles.length === 0 ? (
            <EmptyState
              title="No vehicles match your search"
              message="Try broadening your filters, choosing different rental dates, or resetting search keywords."
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#DFE6EC] pb-4">
                <h3 className="font-display font-bold text-lg text-[#16324F]">
                  Filter Fleet
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#66747E] hover:text-[#24313A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date Availability Toggle */}
              <div className="p-3 bg-[#EAF0F3] rounded-xl text-xs space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAvailableOnDates}
                    onChange={(e) => setOnlyAvailableOnDates(e.target.checked)}
                    className="rounded text-[#2F6F6D]"
                  />
                  <span className="font-semibold text-[#16324F]">Only available on my dates</span>
                </label>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      selectedCategory === 'all'
                        ? 'bg-[#16324F] text-white border-[#16324F]'
                        : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC]'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        selectedCategory === cat.slug
                          ? 'bg-[#16324F] text-white border-[#16324F]'
                          : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Transmission
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'Automatic', 'Manual'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTransmission(t)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        selectedTransmission === t
                          ? 'bg-[#2F6F6D] text-white border-[#2F6F6D]'
                          : 'bg-[#F8F6F1] text-[#24313A] border-[#DFE6EC]'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'Automatic' ? 'Auto' : 'Manual'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#66747E]">Max Rate</span>
                  <span className="font-bold text-[#16324F]">Rs {maxPrice}/day</span>
                </div>
                <input
                  type="range"
                  min="1400"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#2F6F6D]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#DFE6EC] space-y-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-[#D97745] text-white py-3 rounded-xl font-bold text-sm shadow-md"
              >
                Apply Filters ({displayedVehicles.length} vehicles)
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full text-[#66747E] py-2 text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
