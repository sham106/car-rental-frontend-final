/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
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
import { AdminAuthProvider } from './context/AdminAuthContext';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/admin/AdminResetPasswordPage';
const AdminApp = lazy(() => import('./pages/admin/AdminApp').then(module => ({ default: module.AdminApp })));

export default function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Suspense fallback={<div role="status" className="p-8 text-center">Loading administration...</div>}>
        <Routes>
          <Route path="/admin" element={<AdminAuthProvider />}>
            <Route path="login" element={<AdminLoginPage />} />
            <Route path="forgot-password" element={<AdminForgotPasswordPage />} />
            <Route path="reset-password" element={<AdminResetPasswordPage />} />
            <Route element={<RequireAdmin />}>
              <Route index element={<AdminApp />} />
              <Route path="*" element={<AdminApp />} />
            </Route>
          </Route>
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
        </Suspense>
      </BrowserRouter>
    </SearchProvider>
  );
}

