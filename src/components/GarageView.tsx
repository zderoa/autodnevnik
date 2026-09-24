import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Wrench, 
  Plus, 
  Search, 
  Download, 
  Coins, 
  AlertTriangle, 
} from 'lucide-react';
import { Vehicle, ServiceRecord, User } from '../types';
import { VehicleCard } from './VehicleCard';

interface GarageViewProps {
  user: User;
  vehicles: Vehicle[];
  services: ServiceRecord[];
  onSelectVehicle: (id: string) => void;
  onOpenAddVehicle: () => void;
  onOpenAddService: (vehicleId?: string) => void;
  onExportBooklet: (vehicle: Vehicle) => void;
  onExportGarageReport: () => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  user,
  vehicles,
  services,
  onSelectVehicle,
  onOpenAddVehicle,
  onOpenAddService,
  onExportBooklet,
  onExportGarageReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const totalCost = useMemo(() => {
    return services.reduce((acc, s) => acc + (s.cost || 0), 0);
  }, [services]);

  // Expiring registrations count
  const expiringRegCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return vehicles.filter((v) => {
      if (!v.regDate) return false;
      const reg = new Date(v.regDate + 'T00:00:00');
      const exp = new Date(reg);
      exp.setFullYear(exp.getFullYear() + 1);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 30;
    }).length;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.customName && v.customName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === 'all' || v.type === filterType;
      return matchSearch && matchType;
    });
  }, [vehicles, searchQuery, filterType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Stats - Gray Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aktivna vozila</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-slate-800 flex items-center justify-center shadow-2xs">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{vehicles.length}</span>
            <span className="text-xs text-slate-500 font-medium">u garaži</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ukupno servisa</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-slate-800 flex items-center justify-center shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{services.length}</span>
            <span className="text-xs text-slate-500 font-medium">upisanih zahvata</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ukupno uloženo</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 text-slate-800 flex items-center justify-center shadow-2xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {totalCost.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-bold">{user.settings.currency}</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hitni podsjetnici</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${
                expiringRegCount > 0 ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono text-slate-900`}
            >
              {expiringRegCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">isteka registracije</span>
          </div>
        </div>
      </div>

      {/* Control bar: Search, Filters, and CTAs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži po marki, modelu, tablicama ili broju šasije..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>

          {/* Filter by vehicle type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 shadow-2xs"
          >
            <option value="all">Svi tipovi</option>
            <option value="automobil">Automobili</option>
            <option value="motor">Motocikli</option>
            <option value="kombi">Kombiji</option>
            <option value="kamion">Kamioni</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {vehicles.length > 0 && (
            <button
              onClick={onExportGarageReport}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200/70 border border-slate-200/90 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Flotni PDF</span>
            </button>
          )}

          <button
            onClick={onOpenAddVehicle}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj novo vozilo</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid - Gray Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center bg-slate-100 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-700 mx-auto flex items-center justify-center shadow-2xs">
            <Car className="w-7 h-7 text-slate-800" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'Nijedno vozilo ne odgovara pretrazi' : 'Vaša garaža je trenutno prazna'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'Pokušajte sa drugačijim ključnim riječima ili poništite filtere.'
                : 'Dodajte vaše prvo vozilo kako biste počeli voditi digitalnu servisnu knjižicu i pratiti troškove.'}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              Poništi pretragu
            </button>
          ) : (
            <button
              onClick={onOpenAddVehicle}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Dodaj prvo vozilo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const vServices = services.filter((s) => s.vehicleId === vehicle.id);
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                services={vServices}
                currency={user.settings.currency}
                onSelect={onSelectVehicle}
                onAddService={onOpenAddService}
                onExportPdf={onExportBooklet}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
