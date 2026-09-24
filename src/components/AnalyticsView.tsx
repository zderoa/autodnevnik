import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Coins, 
  TrendingUp, 
  Wrench, 
  FileDown
} from 'lucide-react';
import { Vehicle, ServiceRecord, User, ServiceType } from '../types';
import { SERVICE_TYPE_CONFIG } from '../data/constants';

interface AnalyticsViewProps {
  vehicles: Vehicle[];
  services: ServiceRecord[];
  user: User;
  onExportGarageReport: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  vehicles,
  services,
  user,
  onExportGarageReport,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');

  const filteredServices = useMemo(() => {
    if (selectedVehicleId === 'all') return services;
    return services.filter((s) => s.vehicleId === selectedVehicleId);
  }, [services, selectedVehicleId]);

  const targetVehicles = useMemo(() => {
    if (selectedVehicleId === 'all') return vehicles;
    return vehicles.filter((v) => v.id === selectedVehicleId);
  }, [vehicles, selectedVehicleId]);

  const totalCost = useMemo(() => {
    return filteredServices.reduce((sum, s) => sum + (s.cost || 0), 0);
  }, [filteredServices]);

  // Breakdown by Service Type
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { type: ServiceType; count: number; cost: number; label: string }> = {};

    filteredServices.forEach((s) => {
      const cfg = SERVICE_TYPE_CONFIG[s.type];
      if (!map[s.type]) {
        map[s.type] = {
          type: s.type,
          count: 0,
          cost: 0,
          label: cfg.label,
        };
      }
      map[s.type].count += 1;
      map[s.type].cost += s.cost || 0;
    });

    return Object.values(map).sort((a, b) => b.cost - a.cost);
  }, [filteredServices]);

  // Top Servicers / Workshops
  const topServicers = useMemo(() => {
    const map: Record<string, { name: string; count: number; cost: number }> = {};
    filteredServices.forEach((s) => {
      const name = s.servicer?.trim() || 'Ostali serviseri';
      if (!map[name]) {
        map[name] = { name, count: 0, cost: 0 };
      }
      map[name].count += 1;
      map[name].cost += s.cost || 0;
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 5);
  }, [filteredServices]);

  // Average cost per service
  const avgCostPerService = filteredServices.length > 0 ? Math.round(totalCost / filteredServices.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Vehicle Filter & Export - Gray Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-800" />
            Analitika troškova i investicija
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pregled ulaganja u održavanje, raspodjela po kategorijama radova i servisima
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
          >
            <option value="all">Sva vozila u garaži ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.customName || `${v.brand} ${v.model}`} [{v.plate}]
              </option>
            ))}
          </select>

          <button
            onClick={onExportGarageReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Preuzmi PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Gray Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Ukupno ulaganje
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {totalCost.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-700">{user.settings.currency}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              kroz {filteredServices.length} evidentiranih servisa
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Prosjek po servisu
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {avgCostPerService.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-700">{user.settings.currency}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              redovno i vanredno održavanje
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Obuhvaćena flota
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {targetVehicles.length}
              </span>
              <span className="text-xs font-bold text-slate-500">vozila</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              aktivno u elektronskoj evidenciji
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Expense Breakdown - Gray Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 border border-slate-200/90 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Troškovi po vrsti servisa
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Udio u ukupnom</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nema zabilježenih troškova za prikaz raspodjele.
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((item) => {
                const percentage = totalCost > 0 ? Math.round((item.cost / totalCost) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.label}</span>
                        <span className="text-slate-500 text-[11px]">({item.count}x)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {item.cost.toLocaleString()} {user.settings.currency}
                        </span>
                        <span className="font-mono text-slate-500 w-9 text-right font-medium">{percentage}%</span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Workshops / Servicers - Gray Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 border border-slate-200/90 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Glavni servisi i mehaničari
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Ukupno povjerenih sredstava</span>
          </div>

          {topServicers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nema podataka o serviserima.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {topServicers.map((srv, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-[11px] font-bold shadow-2xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{srv.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{srv.count} zabilježenih servisa</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900">
                      {srv.cost.toLocaleString()} {user.settings.currency}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {totalCost > 0 ? Math.round((srv.cost / totalCost) * 100) : 0}% ukupno
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
