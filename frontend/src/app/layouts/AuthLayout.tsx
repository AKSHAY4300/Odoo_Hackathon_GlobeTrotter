import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-runway-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-4">
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="GlobeTrotter Logo"
              className="w-12 h-12 object-contain rounded-full shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="text-left">
              <span className="font-display font-bold text-2xl tracking-tight text-ink-navy flex items-center gap-1">
                GLOBE<span className="text-boarding-amber">TROTTER</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-tarmac-grey block -mt-1">
                TRAVEL CONCIERGE & PASSPORT
              </span>
            </div>
          </Link>
        </div>

        <div className="bg-white border border-tarmac-grey/25 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Visual Storytelling Banner */}
          <div className="md:col-span-5 bg-ink-navy text-runway-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-boarding-amber/10 rounded-full blur-3xl" />
            <div className="absolute -left-16 -top-16 w-64 h-64 bg-signal-teal/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-ink-navy-900 border border-white/10 px-3 py-1 rounded text-xs font-mono text-boarding-amber">
                <Compass className="w-3.5 h-3.5 animate-spin" />
                <span>EXPEDITION TERMINAL</span>
              </div>

              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                Craft your dream journey across the globe.
              </h2>

              <p className="text-xs sm:text-sm text-tarmac-grey-200 leading-relaxed">
                Connect world capitals, attach unforgettable tours, monitor daily spend limits, and share your personal travel pass with friends.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 space-y-3 text-xs text-tarmac-grey-300 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-signal-teal shrink-0" />
                <span>Instant passport check-in</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-boarding-amber shrink-0" />
                <span>Live smart budget calculation</span>
              </div>
            </div>
          </div>

          {/* Right Auth Form Container */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
            <Outlet />
          </div>
        </div>

        {/* Developer Branding Footer */}
        <div className="text-center pt-2 text-xs font-mono text-tarmac-grey flex items-center justify-center gap-1.5">
          <span>GlobeTrotter Platform</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-stamp-red fill-stamp-red" /> by <strong className="text-ink-navy">Akshay</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
