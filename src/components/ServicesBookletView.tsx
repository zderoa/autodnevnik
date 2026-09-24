import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar, 
  Gauge, 
  Building2, 
  FileDown, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Vehicle, ServiceRecord, User, ServiceType } from '../types';
import { SERVICE_TYPE_CONFIG } from '../data/constants';

interface ServicesBookletViewProps {
  vehicles: Vehicle[];
  services: ServiceRecord[];
  user: User;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onOpenAddService: (vehicleId?: string) => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (serviceId: string) => void;
  onExportSlip: (service: ServiceRecord, vehicle: Vehicle) => void;
  onExportBooklet: (vehicle: Vehicle) => void;
}

export const ServicesBookletView: React.FC<ServicesBookletViewProps> = ({
  vehicles,
  services,
  user,
  selectedVehicleId,
  onSelectVehicle,
  onOpenAddService,
  onEditService,
  onDeleteService,
  onExportSlip,
  onExportBooklet,
}) => {
  const [vehicleFilter, setVehicleFilter] = useState<string>(selectedVehicleId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeVehicle = vehicles.find((v) => v.id === vehicleFilter);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchVehicle = vehicleFilter === 'all' || s.vehicleId === vehicleFilter;
      const matchType = typeFilter === 'all' || s.type === typeFilter;
      const matchSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.servicer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchVehicle && matchType && matchSearch;
    });
  }, [services, vehicleFilter, typeFilter, searchQuery]);

  const totalCost = useMemo(() => {
    return filteredServices.reduce((sum, s) => sum + (s.cost || 0), 0);
  }, [filteredServices]);

  const fmtDateStr = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header - Gray Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-800" />
            Elektronska servisna knjižica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kompletna hronologija popravki, redovnih servisa i zamjene dijelova ({filteredServices.length} unosa)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeVehicle && (
            <button
              onClick={() => onExportBooklet(activeVehicle)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors whitespace-nowrap shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Izvezi PDF</span>
            </button>
          )}

          <button
            onClick={() => onOpenAddService(vehicleFilter !== 'all' ? vehicleFilter : undefined)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Upiši novi servis</span>
          </button>
        </div>
      </div>

      {/* Filter and search toolbar - Gray Card */}
      <div className="p-3 bg-slate-100 border border-slate-200/90 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Vehicle switcher */}
          <select
            value={vehicleFilter}
            onChange={(e) => {
              setVehicleFilter(e.target.value);
              if (e.target.value !== 'all') onSelectVehicle(e.target.value);
            }}
            className="px-3 py-2 bg-white border border-slate-300/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
          >
            <option value="all">Sva vozila ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.customName || `${v.brand} ${v.model}`} [{v.plate}]
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži po opisu, dijelovima, serviseru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 shadow-2xs"
          >
            <option value="all">Sve vrste zahvata</option>
            {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((tKey) => (
              <option key={tKey} value={tKey}>
                {SERVICE_TYPE_CONFIG[tKey].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono self-end md:self-auto font-medium">
          <span>Ulaganje:</span>
          <strong className="text-slate-900 font-black font-mono">
            {totalCost.toLocaleString()} {user.settings.currency}
          </strong>
        </div>
      </div>

      {/* Services List Feed - Gray Cards */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-slate-100 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
          <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm text-slate-600">Nema evidentiranih servisa po odabranim kriterijumima.</p>
          <button
            onClick={() => onOpenAddService(vehicleFilter !== 'all' ? vehicleFilter : undefined)}
            className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            + Upiši novi servis
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => {
            const isExpanded = expandedId === service.id;
            const vehicle = vehicles.find((v) => v.id === service.vehicleId);
            const cfg = SERVICE_TYPE_CONFIG[service.type];

            return (
              <div
                key={service.id}
                className="bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-150 shadow-2xs"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : service.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                      <Wrench className="w-5 h-5 text-slate-800" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">{service.title}</h3>
                        {vehicle && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                            {vehicle.customName || `${vehicle.brand} ${vehicle.model}`} [{vehicle.plate}]
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          {cfg.label.split(' ')[0]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {fmtDateStr(service.date)}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-slate-900 font-semibold">{service.mileage.toLocaleString()} km</span>
                        {service.servicer && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="truncate max-w-[200px] text-slate-600">{service.servicer}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <div className="flex flex-col sm:text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Iznos</span>
                      <span className="text-base font-black font-mono text-slate-900">
                        {service.cost.toLocaleString()} {service.currency || user.settings.currency}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 border-t border-slate-200 bg-white/90 space-y-4 pt-4 animate-in fade-in duration-150">
                    {service.categories && service.categories.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Izvršeni radovi i provjere:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                          {service.categories.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.parts && service.parts.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Dijelovi i materijal:
                        </span>
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Dio</th>
                                <th className="py-2 px-3">Brend</th>
                                <th className="py-2 px-3 text-center">Kol.</th>
                                <th className="py-2 px-3 text-right">Cijena</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {service.parts.map((p, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 px-3 text-slate-900 font-medium">{p.name}</td>
                                  <td className="py-2 px-3 text-slate-500">{p.brand || '—'}</td>
                                  <td className="py-2 px-3 text-center font-mono text-slate-700">{p.quantity}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                    {p.price ? `${p.price.toLocaleString()} ${service.currency || user.settings.currency}` : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {service.notes && (
                      <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <strong className="text-slate-900">Napomena:</strong> {service.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="text-[11px] text-slate-500 font-mono font-medium">
                        {service.invoiceNumber && `Račun: ${service.invoiceNumber}`}
                      </div>

                      <div className="flex items-center gap-2">
                        {vehicle && (
                          <button
                            type="button"
                            onClick={() => onExportSlip(service, vehicle)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors shadow-2xs"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>PDF Potvrda</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditService(service)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Izmijeni</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteService(service.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Obriši</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
