import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Plus, 
  User, 
  Shield, 
  LogOut, 
  Globe, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTripDraftStore } from '../../stores/tripDraftStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ShareModal } from '../../components/trip/ShareModal';
import { Drawer } from '../../components/ui/Drawer';
import { CitySearchContent } from '../../pages/explore/CitySearchContent';
import { ActivitySearchContent } from '../../pages/explore/ActivitySearchContent';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuthStore();
  const { 
    isCityDrawerOpen, 
    closeCityDrawer, 
    isActivityDrawerOpen, 
    closeActivityDrawer,
    activeTripId,
    targetStopId,
    targetDate
  } = useTripDraftStore();
  const { showToast } = useUIStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoleToggle = async () => {
    const nextRole = user?.role === 'admin' ? 'traveler' : 'admin';
    await switchRole(nextRole);
    showToast('Role Switched', `Active role set to ${nextRole.toUpperCase()}`, 'info');
    if (nextRole === 'admin') {
      navigate('/admin');
    }
  };

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: <Compass className="w-4 h-4" /> },
    { label: 'My Trips', path: '/trips', icon: <Map className="w-4 h-4" /> },
    { label: 'Cities', path: '/explore/cities', icon: <Globe className="w-4 h-4" /> },
    { label: 'Activities', path: '/explore/activities', icon: <Sparkles className="w-4 h-4" /> },
  ];

  if (user?.role === 'admin') {
    navLinks.push({
      label: 'Admin Hub',
      path: '/admin',
      icon: <Shield className="w-4 h-4 text-boarding-amber" />,
    });
  }

  return (
    <div className="min-h-screen bg-runway-white flex flex-col selection:bg-boarding-amber selection:text-ink-navy">
      {/* Top Header / Departure Board Navigation Bar */}
      <header className="sticky top-0 z-40 bg-ink-navy text-runway-white border-b border-ink-navy-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img
                  src="/logo.png"
                  alt="GlobeTrotter"
                  className="w-10 h-10 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1">
                    GLOBE<span className="text-boarding-amber">TROTTER</span>
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-tarmac-grey-300 block -mt-1">
                    ITINERARY SYSTEM
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? 'bg-boarding-amber text-ink-navy shadow-xs font-bold'
                          : 'text-tarmac-grey-200 hover:text-white hover:bg-ink-navy-700'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/trips/new" className="hidden sm:block">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Plan New Trip
                </Button>
              </Link>

              <button
                type="button"
                onClick={handleRoleToggle}
                className="hidden lg:flex items-center gap-1.5 bg-ink-navy-900 border border-white/15 px-2.5 py-1 rounded text-[11px] font-mono text-tarmac-grey-300 hover:text-white hover:border-boarding-amber transition-colors"
                title="Toggle between Traveler and Admin view"
              >
                <span>Role:</span>
                <span className="font-bold text-boarding-amber uppercase">
                  {user?.role || 'traveler'}
                </span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-boarding-amber transition-all"
                  aria-label="User profile menu"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name || 'Traveler'}
                    className="w-8 h-8 rounded-full object-cover border border-boarding-amber/50"
                  />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-11 w-56 bg-white border border-tarmac-grey/20 rounded-xl shadow-2xl py-2 z-30 text-ink-navy animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-tarmac-grey/15">
                        <p className="font-bold text-xs truncate text-ink-navy">{user?.name}</p>
                        <p className="text-[11px] font-mono text-tarmac-grey truncate">{user?.email}</p>
                        <Badge variant="amber" size="sm" className="mt-1.5">
                          {user?.role?.toUpperCase()}
                        </Badge>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2 text-xs hover:bg-runway-white flex items-center gap-2.5 text-ink-navy transition-colors"
                      >
                        <User className="w-4 h-4 text-signal-teal" />
                        <span>Traveler Profile & Settings</span>
                      </Link>

                      <Link
                        to="/trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-4 py-2 text-xs hover:bg-runway-white flex items-center gap-2.5 text-ink-navy transition-colors"
                      >
                        <Map className="w-4 h-4 text-boarding-amber" />
                        <span>My Voyages</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2 text-xs hover:bg-runway-white flex items-center gap-2.5 text-ink-navy transition-colors"
                        >
                          <Shield className="w-4 h-4 text-boarding-amber" />
                          <span>Admin Analytics Hub</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleRoleToggle();
                        }}
                        className="w-full px-4 py-2 text-xs hover:bg-runway-white flex items-center gap-2.5 text-ink-navy border-t border-tarmac-grey/10 font-mono transition-colors"
                      >
                        <Shield className="w-4 h-4 text-tarmac-grey" />
                        <span>Switch to {user?.role === 'admin' ? 'Traveler' : 'Admin'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full px-4 py-2 text-xs hover:bg-stamp-red/10 flex items-center gap-2.5 text-stamp-red border-t border-tarmac-grey/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-tarmac-grey-300 hover:text-white rounded-lg hover:bg-ink-navy-700"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 bg-ink-navy-900 border-b border-ink-navy-700 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold flex items-center gap-2.5 ${
                    isActive ? 'bg-boarding-amber text-ink-navy' : 'text-runway-white hover:bg-ink-navy-700'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10">
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-boarding-amber text-ink-navy font-semibold px-4 py-2.5 rounded-md text-sm shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Plan New Trip</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      <ShareModal />

      <Drawer
        isOpen={isCityDrawerOpen}
        onClose={closeCityDrawer}
        title="Explore Destinations"
        subtitle="Select a city stop to add to your itinerary"
      >
        <CitySearchContent tripId={activeTripId} onClose={closeCityDrawer} />
      </Drawer>

      <Drawer
        isOpen={isActivityDrawerOpen}
        onClose={closeActivityDrawer}
        title="Explore Activities & Experiences"
        subtitle="Attach tours, culture passes, and dining to this stop"
      >
        <ActivitySearchContent 
          tripId={activeTripId} 
          stopId={targetStopId} 
          targetDate={targetDate} 
          onClose={closeActivityDrawer} 
        />
      </Drawer>

      <footer className="bg-white border-t border-tarmac-grey/15 py-6 text-center text-xs text-tarmac-grey">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-boarding-amber" />
            <span className="font-mono text-ink-navy font-semibold">GLOBETROTTER V1.0</span>
            <span>— Production Multi-City Travel Planner</span>
          </div>
          <span className="font-mono text-[11px] text-tarmac-grey">
            Smart Multi-City Routing & Travel Itinerary Engine
          </span>
        </div>
      </footer>
    </div>
  );
};
