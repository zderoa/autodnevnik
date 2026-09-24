import React from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  Bus, 
  Wrench, 
  Gauge, 
  FileDown, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Plus
} from 'lucide-react';
import { Vehicle, ServiceRecord } from '../types';
import { LicensePlate } from './LicensePlate';

interface VehicleCardProps {
  vehicle: Vehicle;
  services: ServiceRecord[];
  currency: string;
  onSelect: (id: string) => void;
  onAddService: (id: string) => void;
  onExportPdf: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  services,
  currency,
  onSelect,
  onAddService,
  onExportPdf,
}) => {
  const totalCost = services.reduce((acc, s) => acc + (s.cost || 0), 0);

  // Registration calculations
  let regDaysRemaining = 999;
  let isRegExpired = false;
  if (vehicle.regDate) {
    const regDate = new Date(vehicle.regDate + 'T00:00:00');
    const expiry = new Date(regDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    regDaysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    isRegExpired = regDaysRemaining < 0;
  }

  // Last service & Next service due
  const lastService = services[0] || null;
  const nextServiceMileage = lastService?.nextDueMileage;
  const kmToNextService = nextServiceMileage ? nextServiceMileage - vehicle.currentMileage : null;

  const IconComponent =
    vehicle.type === 'automobil'
      ? Car
      : vehicle.type === 'motor'
      ? Bike
      : vehicle.type === 'kombi'
      ? Truck
      : vehicle.type === 'kamion'
      ? Truck
      : Bus;

  return (
    <div className="group relative flex flex-col justify-between bg-slate-100 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-2xs transition-all duration-200">
      {/* Top row: Icon, Name & Plate */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs group-hover:scale-105 transition-transform">
              <IconComponent className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug">
                {vehicle.customName || `${vehicle.brand} ${vehicle.model}`}
              </h3>
              <p className="text-xs text-slate-500">
                {vehicle.brand} {vehicle.model} · {vehicle.year}
              </p>
            </div>
          </div>
          <LicensePlate plate={vehicle.plate} country={vehicle.country} size="md" />
        </div>

        {/* Technical specs pill row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 py-2 border-y border-slate-200/80 mb-4 font-medium">
          <span className="flex items-center gap-1 font-mono text-slate-900 font-semibold">
            <Gauge className="w-3.5 h-3.5 text-slate-700" />
            {vehicle.currentMileage.toLocaleString()} km
          </span>
          <span className="text-slate-300">·</span>
          <span>{vehicle.fuelType}</span>
          <span className="text-slate-300">·</span>
          <span>
            {vehicle.cc} ccm ({vehicle.kw} kW / {vehicle.hp} KS)
          </span>
          <span className="text-slate-300">·</span>
          <span>{vehicle.transmission.split(' ')[0]}</span>
        </div>

        {/* Status Highlights: Registration & Next Service */}
        <div className="space-y-2 mb-4">
          {/* Registration status */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              {isRegExpired ? (
                <AlertTriangle className="w-4 h-4 text-slate-900 shrink-0" />
              ) : regDaysRemaining <= 30 ? (
                <Clock className="w-4 h-4 text-slate-700 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-slate-700 font-medium">Registracija</span>
            </div>
            <span
              className={`font-semibold ${
                isRegExpired
                  ? 'text-slate-900 font-black'
                  : regDaysRemaining <= 30
                  ? 'text-slate-800 font-bold'
                  : 'text-slate-600'
              }`}
            >
              {isRegExpired
                ? `Istekla prije ${Math.abs(regDaysRemaining)} d.`
                : regDaysRemaining === 0
                ? 'Ističe danas!'
                : `Važi još ${regDaysRemaining} dana`}
            </span>
          </div>

          {/* Next service status */}
          {kmToNextService !== null && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="text-slate-700 font-medium">Sljedeći servis</span>
              </div>
              <span
                className={`font-mono text-xs font-semibold ${
                  kmToNextService <= 0
                    ? 'text-slate-900 font-black'
                    : kmToNextService <= 1500
                    ? 'text-slate-800 font-bold'
                    : 'text-slate-600'
                }`}
              >
                {kmToNextService <= 0
                  ? `Istekao prije ${Math.abs(kmToNextService).toLocaleString()} km`
                  : `za ${kmToNextService.toLocaleString()} km`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Summary & Actions */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-500 font-medium">Uloženo ({services.length} servisa)</span>
          <span className="text-sm font-mono font-bold text-slate-900">
            {totalCost.toLocaleString()} {currency}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onExportPdf(vehicle)}
            title="Preuzmi digitalnu servisnu knjižicu (PDF)"
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200/70 border border-slate-200/90 rounded-xl transition-colors shadow-2xs"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onAddService(vehicle.id)}
            title="Upiši novi servis"
            className="p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-200/70 border border-slate-200/90 rounded-xl transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onSelect(vehicle.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
          >
            <span>Dosije</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
