import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  getTodayString,
  addDays,
  calculateRentalDays,
  validateDateSelection,
  DateValidationResult,
} from '../utils/dateUtils';

interface SearchContextType {
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  returnDate: string;
  selectedCategory: string;
  setPickupLocationId: (id: string) => void;
  setReturnLocationId: (id: string) => void;
  setPickupDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setSameDayReturn: () => void;
  setSelectedCategory: (cat: string) => void;
  setSearchParameters: (params: {
    pickupLocationId?: string;
    returnLocationId?: string;
    pickupDate?: string;
    returnDate?: string;
    selectedCategory?: string;
  }) => void;
  rentalDays: number;
  isSameDay: boolean;
  dateValidation: DateValidationResult;
  todayStr: string;
  resetSearch: () => void;
}

const DEFAULT_PICKUP_LOCATION = 'airport-mru';
const DEFAULT_RETURN_LOCATION = 'airport-mru';

// Set realistic default future dates (e.g. 4 days from today for a 6-day holiday)
function getDefaultDates() {
  const todayStr = getTodayString();
  const pickup = addDays(todayStr, 4);
  const dropoff = addDays(todayStr, 10);

  return {
    pickupDate: pickup,
    returnDate: dropoff,
  };
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaults = getDefaultDates();
  const todayStr = getTodayString();

  const [pickupLocationId, setPickupLocationId] = useState<string>(() => {
    return sessionStorage.getItem('ocr_pickup_loc') || DEFAULT_PICKUP_LOCATION;
  });

  const [returnLocationId, setReturnLocationId] = useState<string>(() => {
    return sessionStorage.getItem('ocr_return_loc') || DEFAULT_RETURN_LOCATION;
  });

  const [pickupDate, setPickupDateInternal] = useState<string>(() => {
    const saved = sessionStorage.getItem('ocr_pickup_date');
    // Prevent loading expired past dates from prior browser sessions
    if (saved && saved >= todayStr) {
      return saved;
    }
    return defaults.pickupDate;
  });

  const [returnDate, setReturnDateInternal] = useState<string>(() => {
    const savedReturn = sessionStorage.getItem('ocr_return_date');
    const savedPickup = sessionStorage.getItem('ocr_pickup_date') || defaults.pickupDate;
    const effectivePickup = savedPickup >= todayStr ? savedPickup : defaults.pickupDate;

    // Validate return date is at least the pickup date (same-day or later)
    if (savedReturn && savedReturn >= effectivePickup) {
      return savedReturn;
    }
    return defaults.returnDate >= effectivePickup ? defaults.returnDate : effectivePickup;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return sessionStorage.getItem('ocr_category') || 'all';
  });

  // Calculate rentalDays and validation result
  const rentalDays = useMemo(() => {
    return calculateRentalDays(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  const dateValidation = useMemo(() => {
    return validateDateSelection(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  const isSameDay = pickupDate === returnDate;

  /**
   * Updates pickup date.
   * - Prevents dates in the past (clamps to today if earlier).
   * - If current return date is earlier than new pickup date, updates return date
   *   to either match (for same-day) or advances it.
   */
  const setPickupDate = (newDate: string) => {
    if (!newDate) return;
    const sanitizedPickup = newDate < todayStr ? todayStr : newDate;
    setPickupDateInternal(sanitizedPickup);

    // If return date is now before the new pickup date, adjust return date to at least the new pickup date
    if (returnDate && returnDate < sanitizedPickup) {
      // Advance by previous duration or default to same-day/next-day
      setReturnDateInternal(sanitizedPickup);
    }
  };

  /**
   * Updates return date.
   * - Ensures return date is at least equal to pickup date (same-day return).
   * - Prevents choosing a return date earlier than pickup date.
   */
  const setReturnDate = (newDate: string) => {
    if (!newDate) return;
    if (newDate < pickupDate) {
      // Clamp to pickup date to ensure valid same-day return instead of an invalid past date
      setReturnDateInternal(pickupDate);
    } else {
      setReturnDateInternal(newDate);
    }
  };

  /**
   * Convenience helper to set same-day return (returns on pickup date).
   */
  const setSameDayReturn = () => {
    if (pickupDate) {
      setReturnDateInternal(pickupDate);
    }
  };

  // Keep sessionStorage in sync so page refreshes don't lose search criteria
  useEffect(() => {
    sessionStorage.setItem('ocr_pickup_loc', pickupLocationId);
    sessionStorage.setItem('ocr_return_loc', returnLocationId);
    sessionStorage.setItem('ocr_pickup_date', pickupDate);
    sessionStorage.setItem('ocr_return_date', returnDate);
    sessionStorage.setItem('ocr_category', selectedCategory);
  }, [pickupLocationId, returnLocationId, pickupDate, returnDate, selectedCategory]);

  const setSearchParameters = (params: {
    pickupLocationId?: string;
    returnLocationId?: string;
    pickupDate?: string;
    returnDate?: string;
    selectedCategory?: string;
  }) => {
    if (params.pickupLocationId) setPickupLocationId(params.pickupLocationId);
    if (params.returnLocationId) setReturnLocationId(params.returnLocationId);
    if (params.pickupDate) setPickupDate(params.pickupDate);
    if (params.returnDate) setReturnDate(params.returnDate);
    if (params.selectedCategory) setSelectedCategory(params.selectedCategory);
  };

  const resetSearch = () => {
    const fresh = getDefaultDates();
    setPickupLocationId(DEFAULT_PICKUP_LOCATION);
    setReturnLocationId(DEFAULT_RETURN_LOCATION);
    setPickupDateInternal(fresh.pickupDate);
    setReturnDateInternal(fresh.returnDate);
    setSelectedCategory('all');
  };

  return (
    <SearchContext.Provider
      value={{
        pickupLocationId,
        returnLocationId,
        pickupDate,
        returnDate,
        selectedCategory,
        setPickupLocationId,
        setReturnLocationId,
        setPickupDate,
        setReturnDate,
        setSameDayReturn,
        setSelectedCategory,
        setSearchParameters,
        rentalDays,
        isSameDay,
        dateValidation,
        todayStr,
        resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

