import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-runway-white flex flex-col selection:bg-boarding-amber selection:text-ink-navy">
      <header className="bg-ink-navy text-runway-white border-b border-ink-navy-700 py-3 px-4 sm:px-8 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="GlobeTrotter Logo"
              className="w-10 h-10 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1">
                GLOBE<span className="text-boarding-amber">TROTTER</span>
              </span>
              <span className="text-[8px] font-mono tracking-widest text-tarmac-grey-300 block -mt-1">
                SHARED VOYAGE PASS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-xs">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" variant="primary" className="text-xs font-bold">
                Start Planning Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-tarmac-grey/15 py-8 text-center text-xs text-tarmac-grey">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-medium text-ink-navy">
            Powered by <strong>GlobeTrotter</strong> — The interactive multi-city travel planning concierge.
          </p>
          <p className="text-[11px] font-sans text-tarmac-grey/80">
            © {new Date().getFullYear()} GlobeTrotter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
