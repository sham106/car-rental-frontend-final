import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Phone, Menu, X, Car, Calendar, ShieldCheck, Compass } from 'lucide-react';
import { BRAND } from '../../constants/theme';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle compact on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Fleet', path: '/fleet' },
    { name: 'About', path: '/about' },
    { name: 'Rental Info / FAQ', path: '/faq' },
    { name: 'Terms', path: '/rental-terms' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        id="site-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#F8F6F1]/95 backdrop-blur-md shadow-sm py-3 border-[#DFE6EC]'
            : 'bg-[#F8F6F1] py-4 sm:py-5 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            id="brand-logo"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F6D] rounded"
          >
            <div className="w-10 h-10 rounded-xl bg-[#16324F] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Compass className="w-5 h-5 text-[#D97745]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-[#16324F] leading-none">
                DailyCar
              </span>
              <span className="text-[11px] font-medium tracking-widest text-[#2F6F6D] uppercase mt-0.5">
                Car Rental Mauritius
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'text-[#16324F] bg-[#EAF0F3] font-bold'
                      : 'text-[#66747E] hover:text-[#16324F] hover:bg-black/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Group */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${BRAND.phone}`}
              id="header-call-btn"
              className="flex items-center gap-1.5 text-xs xl:text-sm font-medium text-[#16324F] hover:text-[#2F6F6D] transition-colors py-2 px-3 rounded-lg hover:bg-[#EAF0F3]"
              title="Speak with our concierge team"
            >
              <Phone className="w-4 h-4 text-[#2F6F6D]" />
              <span className="hidden xl:inline">{BRAND.phoneDisplay}</span>
            </a>

            <Link
              to="/admin"
              id="header-admin-cta"
              className="inline-flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-[#16324F] bg-[#EAF0F3] hover:bg-[#DDE5E9] py-2 px-3.5 rounded-xl transition-colors border border-[#DFE6EC]"
              title="Open Fleet Operations & Admin Portal"
            >
              <span className="w-2 h-2 rounded-full bg-[#4F7D61]"></span>
              <span>Operations Portal</span>
            </Link>

            <Link
              to="/fleet"
              id="header-find-car-cta"
              className="inline-flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D97745]"
            >
              <Car className="w-4 h-4" />
              <span>Find a Car</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/fleet"
              className="sm:hidden inline-flex items-center gap-1 bg-[#D97745] text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm"
            >
              <span>Fleet</span>
            </Link>
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#16324F] hover:bg-[#EAF0F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F6D]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Sheet */}
        {mobileMenuOpen && (
          <div
            id="mobile-drawer"
            className="lg:hidden fixed inset-x-0 top-[65px] bg-[#F8F6F1] border-b border-[#DFE6EC] shadow-xl px-4 pt-3 pb-6 max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="flex flex-col space-y-1 divide-y divide-[#DFE6EC]/60">
              <div className="py-2 flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-[#16324F] text-white'
                          : 'text-[#24313A] hover:bg-[#EAF0F3]'
                      }`
                    }
                  >
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Quick Contacts */}
              <div className="pt-4 flex flex-col space-y-3">
                <a
                  href={`tel:${BRAND.phone}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#16324F] font-semibold bg-[#EAF0F3] rounded-xl"
                >
                  <Phone className="w-4 h-4 text-[#2F6F6D]" />
                  <span>Call: {BRAND.phoneDisplay}</span>
                </a>
                <Link
                  to="/admin"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#17324D] hover:bg-[#1F4366] text-white py-3 rounded-xl font-bold text-sm shadow-md"
                >
                  <span>Operations Portal (Admin)</span>
                </Link>
                <Link
                  to="/fleet"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] text-white py-3 rounded-xl font-bold text-sm shadow-md"
                >
                  <Car className="w-5 h-5" />
                  <span>Find Available Cars</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
