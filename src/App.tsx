/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchProvider } from './context/SearchContext';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { FleetPage } from './pages/FleetPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { BookingRequestPage } from './pages/BookingRequestPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { RentalTermsPage } from './pages/RentalTermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminApp } from './pages/admin/AdminApp';

export default function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/vehicle/:slug" element={<VehicleDetailPage />} />
            <Route path="/book" element={<BookingRequestPage />} />
            <Route path="/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/rental-terms" element={<RentalTermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

