import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ShieldCheck } from 'lucide-react';

export function AdminAuthFrame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#F4F6F7] text-[#24313A] flex flex-col">
    <header className="max-w-6xl w-full mx-auto px-6 py-7 flex items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-3" aria-label="DailyCar home">
        <span className="bg-[#17324D] rounded-xl p-3 text-[#D97745]"><Compass className="w-6 h-6" /></span>
        <span><strong className="block tracking-wider text-[#17324D]">DailyCar</strong><span className="text-xs text-[#65727B]">Car Rental Mauritius</span></span>
      </Link>
      <Link to="/" className="text-xs font-semibold flex items-center gap-2 text-[#35658A]"><ArrowLeft className="w-4 h-4" /><span>Back to website</span></Link>
    </header>
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
      <div className="grid lg:grid-cols-2 max-w-5xl w-full rounded-3xl border border-[#DCE2E6] overflow-hidden shadow-xl bg-white">
        <section className="hidden lg:flex bg-[#17324D] p-12 text-white flex-col justify-between min-h-[540px]">
          <div><div className="text-xs tracking-[0.2em] uppercase text-[#A7CBC9] mb-8">Fleet operations</div>
            <h2 className="font-display text-4xl font-bold leading-tight">Every journey starts<br />with a ready fleet.</h2>
            <p className="text-sm leading-7 text-[#C2D1DC] mt-6 max-w-sm">Your workspace for vehicle management, rental coordination and daily operations.</p>
          </div>
          <div className="border-t border-white/15 pt-6 flex gap-3 items-start"><ShieldCheck className="w-5 h-5 text-[#A7CBC9] shrink-0" /><p className="text-xs leading-6 text-[#C2D1DC]">Restricted to authorized DailyCar administrators. Use the account provided by your team.</p></div>
        </section>
        <section className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="inline-flex text-[#2F6F6D] text-xs font-bold uppercase tracking-wider mb-3">Administrator access</div>
          <h1 className="font-display font-bold text-3xl text-[#17324D]">{title}</h1>
          <p className="text-sm leading-6 text-[#65727B] mt-3 mb-7">{description}</p>
          {children}
        </section>
      </div>
    </div>
    <footer className="text-center px-4 py-6 text-xs text-[#65727B]">DailyCar · Mauritius</footer>
  </main>;
}

export const authInputClass = 'w-full rounded-xl border border-[#CAD5DF] bg-white px-4 py-3 text-sm outline-none focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 disabled:opacity-60';
export const authButtonClass = 'w-full rounded-xl bg-[#17324D] px-4 py-3 text-sm font-semibold text-white hover:bg-[#244B6E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6F6D] disabled:opacity-60 disabled:cursor-wait transition-colors';
