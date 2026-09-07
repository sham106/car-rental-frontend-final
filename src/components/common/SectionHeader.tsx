import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  categoryTitle?: string;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  categoryTitle,
  title,
  description,
  actionText,
  actionHref,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10 ${
        align === 'center' ? 'text-center md:text-left items-center' : ''
      } ${className}`}
    >
      <div className={align === 'center' ? 'mx-auto text-center max-w-2xl' : 'max-w-2xl'}>
        {categoryTitle && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2F6F6D] mb-1">
            {categoryTitle}
          </span>
        )}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#16324F] tracking-tight leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-[#66747E] mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D97745] hover:text-[#c26534] transition-colors group flex-shrink-0"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
};
