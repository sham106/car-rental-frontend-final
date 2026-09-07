import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Car, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#EAF0F3] text-[#2F6F6D] flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#D97745]">
          404 Error
        </span>
        <h1 className="font-display font-extrabold text-3xl text-[#16324F]">
          Page Not Found
        </h1>
        <p className="text-sm text-[#66747E] leading-relaxed">
          The coastal road you are looking for has taken a different turn or does not exist.
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16324F] hover:bg-[#2F6F6D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#CAD5DF] text-[#16324F] text-xs font-semibold rounded-xl shadow-xs hover:bg-[#F8F6F1] transition-colors"
        >
          <Car className="w-4 h-4 text-[#2F6F6D]" />
          <span>Browse Fleet</span>
        </Link>
      </div>
    </div>
  );
};
