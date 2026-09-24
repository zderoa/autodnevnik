import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  PieChart, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  ChevronDown, 
  ShieldCheck,
} from 'lucide-react';
import { User, Vehicle } from '../types';
import { LicensePlate } from './LicensePlate';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  remindersCount: number;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAddVehicle: () => void;
  onOpenAddService: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  remindersCount,
  onOpenAuth,
  onLogout,
  onOpenAddVehicle,
  onOpenAddService,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (vehicleRef.current && !vehicleRef.current.contains(e.target as Node)) {
        setVehicleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'garage', label: 'Garaža & Vozila', icon: Car },
    { id: 'services', label: 'Servisna Knjižica', icon: Wrench },
    { id: 'analytics', label: 'Troškovi & Analitika', icon: PieChart },
    { id: 'reminders', label: 'Podsjetnici', icon: Bell, badge: remindersCount },
    { id: 'settings', label: 'Podešavanja', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Wordmark & Quick Vehicle Switcher */}
          <div className="flex items-center gap-5 sm:gap-6">
            <button
              onClick={() => onTabChange('garage')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  AutoDnevnik
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 leading-tight mt-0.5">
                  Servisna Evidencija
                </span>
              </div>
            </button>

            {/* Quick Vehicle Switcher */}
            {user && vehicles.length > 0 && (
              <div className="relative hidden md:block" ref={vehicleRef}>
                <button
                  type="button"
                  onClick={() => setVehicleMenuOpen(!vehicleMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
                >
                  <Car className="w-3.5 h-3.5 text-slate-700" />
                  <span className="max-w-[140px] truncate font-bold text-slate-800">
                    {selectedVehicle?.customName || `${selectedVehicle?.brand} ${selectedVehicle?.model}`}
                  </span>
                  {selectedVehicle && (
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      {selectedVehicle.plate}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {vehicleMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Izaberi aktivno vozilo
                    </div>
                    <div className="space-y-0.5">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            onSelectVehicle(v.id);
                            setVehicleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                            selectedVehicle?.id === v.id
                              ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold">{v.customName || `${v.brand} ${v.model}`}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{v.currentMileage.toLocaleString()} km</div>
                          </div>
                          <LicensePlate plate={v.plate} country={v.country} size="sm" />
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          setVehicleMenuOpen(false);
                          onOpenAddVehicle();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Dodaj novo vozilo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-200/90 text-slate-900 shadow-xs border border-slate-300/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary Actions & Account Profile */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <button
                  onClick={onOpenAddService}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upiši servis</span>
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-900 max-w-[110px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-none truncate max-w-[110px]">
                        {user.email}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-700 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-slate-800" />
                          Aktivan nalog ({user.settings.currency})
                        </div>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onTabChange('settings');
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left font-medium"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          Podešavanja naloga
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onOpenAddVehicle();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left font-medium"
                        >
                          <Car className="w-3.5 h-3.5 text-slate-500" />
                          Dodaj novo vozilo
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-left font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Odjavi se sa naloga
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl transition-colors"
                >
                  Prijavi se
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
                >
                  Registracija
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1.5 -mx-4 px-4 no-scrollbar bg-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-900 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
