import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Wrench, 
  Plus, 
  FileDown, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Gauge, 
  Calendar, 
  Clock, 
  Shield, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Vehicle, ServiceRecord, User, ServiceType } from '../types';
import { SERVICE_TYPE_CONFIG } from '../data/constants';
import { LicensePlate } from './LicensePlate';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  services: ServiceRecord[];
  user: User;
  onBack: () => void;
  onEditVehicle: () => void;
  onDeleteVehicle: () => void;
  onAddService: () => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (serviceId: string) => void;
  onExportBooklet: () => void;
  onExportServiceSlip: (service: ServiceRecord) => void;
  onUpdateMileage: (newMileage: number) => void;
}

export const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({
  vehicle,
  services,
  user,
  onBack,
  onEditVehicle,
  onDeleteVehicle,
  onAddService,
  onEditService,
  onDeleteService,
  onExportBooklet,
  onExportServiceSlip,
  onUpdateMileage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [copiedVin, setCopiedVin] = useState(false);
  const [isEditingMileage, setIsEditingMileage] = useState(false);
  const [mileageInput, setMileageInput] = useState(vehicle.currentMileage);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Copy VIN
  const handleCopyVin = () => {
    if (!vehicle.vin) return;
    navigator.clipboard.writeText(vehicle.vin);
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  const handleSaveMileage = () => {
    if (mileageInput >= 0) {
      onUpdateMileage(mileageInput);
      setIsEditingMileage(false);
    }
  };

  // Registration calculations
  let regDaysRemaining = 999;
  let isRegExpired = false;
  let regExpiryDate = '';
  if (vehicle.regDate) {
    const regDate = new Date(vehicle.regDate + 'T00:00:00');
    const expiry = new Date(regDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    regExpiryDate = expiry.toISOString().slice(0, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    regDaysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    isRegExpired = regDaysRemaining < 0;
  }

  const totalSpent = useMemo(() => {
    return services.reduce((acc, s) => acc + (s.cost || 0), 0);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.servicer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.parts.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === 'all' || s.type === selectedType;
      return matchSearch && matchType;
    });
  }, [services, searchQuery, selectedType]);

  // Find last specific services for maintenance status
  const lastSmallService = services.find((s) => s.type === 'mali_servis');
  const lastBigService = services.find((s) => s.type === 'veliki_servis');
  const lastBrakeService = services.find((s) => s.type === 'kocnice_ovjes');

  const fmtDateStr = (d?: string) => {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Nazad u garažu</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditVehicle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Uredi vozilo</span>
          </button>
          <button
            type="button"
            onClick={onExportBooklet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF Knjižica</span>
          </button>
          <button
            type="button"
            onClick={onAddService}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upiši servis</span>
          </button>
        </div>
      </div>

      {/* Vehicle Technical Passport - Gray Card */}
      <div className="bg-slate-100 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          {/* Vehicle Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {vehicle.customName || `${vehicle.brand} ${vehicle.model}`}
              </h1>
              <LicensePlate plate={vehicle.plate} country={vehicle.country} size="lg" />
            </div>

            <p className="text-sm text-slate-600 font-medium">
              {vehicle.brand} {vehicle.model} · {vehicle.year}. godište · {vehicle.bodyType}
            </p>

            {/* VIN copy row */}
            {vehicle.vin && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 text-xs font-mono text-slate-800 shadow-2xs">
                <span className="text-slate-500 font-sans font-medium">Broj šasije (VIN):</span>
                <span className="font-bold tracking-wider">{vehicle.vin}</span>
                <button
                  type="button"
                  onClick={handleCopyVin}
                  className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Kopiraj broj šasije"
                >
                  {copiedVin ? (
                    <Check className="w-3.5 h-3.5 text-slate-800" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Odometer & Quick Update */}
          <div className="flex flex-col items-start lg:items-end gap-2 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-700" />
              Trenutna kilometraža
            </span>

            {isEditingMileage ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={mileageInput}
                  onChange={(e) => setMileageInput(Number(e.target.value))}
                  className="w-32 px-2 py-1 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                />
                <button
                  type="button"
                  onClick={handleSaveMileage}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded hover:bg-slate-800"
                >
                  Snimi
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMileage(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                  {vehicle.currentMileage.toLocaleString()} <span className="text-xs font-normal text-slate-500">km</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMileageInput(vehicle.currentMileage);
                    setIsEditingMileage(true);
                  }}
                  className="text-xs text-slate-800 font-semibold hover:underline"
                >
                  Uredi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200/90 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Motor & Gorivo</span>
            <span className="font-bold text-slate-900">{vehicle.fuelType}</span>
            <span className="text-slate-500 block text-[11px] font-mono">{vehicle.cc} ccm</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Snaga motora</span>
            <span className="font-bold text-slate-900 font-mono">{vehicle.kw} kW</span>
            <span className="text-slate-500 block text-[11px] font-mono">{vehicle.hp} KS</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Mjenjač & Pogon</span>
            <span className="font-bold text-slate-900 truncate block">{vehicle.transmission.split(' ')[0]}</span>
            <span className="text-slate-500 block text-[11px] truncate">{vehicle.drivetrain.split(' ')[0]}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Registracija</span>
            <span
              className={`font-bold block ${
                isRegExpired ? 'text-slate-900 font-black' : regDaysRemaining <= 30 ? 'text-slate-800' : 'text-slate-700'
              }`}
            >
              {isRegExpired ? 'ISTEKLA' : `Važi još ${regDaysRemaining} d.`}
            </span>
            <span className="text-slate-500 block text-[11px] font-mono">{fmtDateStr(regExpiryDate)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Ukupno servisa</span>
            <span className="font-bold text-slate-900 font-mono">{services.length}</span>
            <span className="text-slate-500 block text-[11px]">evidentirano</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-slate-500 block mb-1 font-medium">Ukupno uloženo</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {totalSpent.toLocaleString()}
            </span>
            <span className="text-slate-500 block text-[11px] font-bold">{user.settings.currency}</span>
          </div>
        </div>

        {vehicle.notes && (
          <div className="mt-4 p-3 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-600 shadow-2xs">
            <strong className="text-slate-800">Bilješke o vozilu:</strong> {vehicle.notes}
          </div>
        )}
      </div>

      {/* Maintenance Radar Cards - Gray Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Mali servis (ulje i filteri)
            </span>
            {lastSmallService ? (
              <>
                <div className="text-sm font-bold text-slate-900">
                  Zadnji: {fmtDateStr(lastSmallService.date)} ({lastSmallService.mileage.toLocaleString()} km)
                </div>
                {lastSmallService.nextDueMileage && (
                  <div className="text-xs text-slate-700 font-mono font-semibold mt-1">
                    Preporučeno na: {lastSmallService.nextDueMileage.toLocaleString()} km
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-500">Nema unesenog malog servisa</span>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs">
            <Wrench className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Veliki servis (zupčasti remen)
            </span>
            {lastBigService ? (
              <>
                <div className="text-sm font-bold text-slate-900">
                  Zadnji: {fmtDateStr(lastBigService.date)} ({lastBigService.mileage.toLocaleString()} km)
                </div>
                {lastBigService.nextDueMileage && (
                  <div className="text-xs text-slate-700 font-mono font-semibold mt-1">
                    Sljedeći na: {lastBigService.nextDueMileage.toLocaleString()} km
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-500">Nema unesenog velikog servisa</span>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Kočioni sistem & ovjes
            </span>
            {lastBrakeService ? (
              <>
                <div className="text-sm font-bold text-slate-900">
                  Zadnji: {fmtDateStr(lastBrakeService.date)} ({lastBrakeService.mileage.toLocaleString()} km)
                </div>
                <div className="text-xs text-slate-600 mt-1 truncate max-w-[200px]">
                  {lastBrakeService.title}
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-500">Nema unosa o kočnicama</span>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 shadow-2xs">
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Service Records Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Istorija servisnih zahvata</h2>
            <p className="text-xs text-slate-500">
              Hronološki pregled svih redovnih i vanrednih popravki ({filteredServices.length} unosa)
            </p>
          </div>

          <button
            onClick={onAddService}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upiši novi servis</span>
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži servise, dijelove ili servisere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              Sve
            </button>
            {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((tKey) => {
              const cfg = SERVICE_TYPE_CONFIG[tKey];
              return (
                <button
                  key={tKey}
                  onClick={() => setSelectedType(tKey)}
                  className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors ${
                    selectedType === tKey
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  {cfg.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services List Feed - Gray Cards */}
        {filteredServices.length === 0 ? (
          <div className="p-10 text-center bg-slate-100 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
            <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-600">
              {searchQuery ? 'Nema servisa koji odgovaraju pretrazi.' : 'Za ovo vozilo još nema unesenih servisa.'}
            </p>
            <button
              onClick={onAddService}
              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              + Upiši prvi servis
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredServices.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              const cfg = SERVICE_TYPE_CONFIG[service.type];

              return (
                <div
                  key={service.id}
                  className="bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-150 shadow-2xs"
                >
                  {/* Card Header row */}
                  <div
                    onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                        <Wrench className="w-5 h-5 text-slate-800" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">{service.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {fmtDateStr(service.date)}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1 font-mono text-slate-800 font-semibold">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            {service.mileage.toLocaleString()} km
                          </span>
                          {service.servicer && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="flex items-center gap-1 truncate max-w-[200px] text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {service.servicer}
                              </span>
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

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 border-t border-slate-200 bg-white/90 space-y-4 pt-4 animate-in fade-in duration-150">
                      {/* Categories checkmarks */}
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

                      {/* Parts breakdown table */}
                      {service.parts && service.parts.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                            Specifikacija dijelova i materijala:
                          </span>
                          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3">Dio / Stavka</th>
                                  <th className="py-2 px-3">Proizvođač</th>
                                  <th className="py-2 px-3 text-center">Količina</th>
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

                      {/* Next Service Due Box */}
                      {(service.nextDueMileage || service.nextDueDate) && (
                        <div className="p-3 bg-slate-200/80 border border-slate-300 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-800" />
                            <span className="text-slate-800">
                              Preporučeni sljedeći servis:{' '}
                              <strong className="text-slate-900 font-bold">
                                {service.nextDueMileage ? `${service.nextDueMileage.toLocaleString()} km` : ''}{' '}
                                {service.nextDueDate ? `(ili do ${fmtDateStr(service.nextDueDate)})` : ''}
                              </strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {service.notes && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <strong className="text-slate-900">Napomena:</strong> {service.notes}
                        </div>
                      )}

                      {/* Service Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="text-[11px] text-slate-500 font-mono font-medium">
                          {service.invoiceNumber && `Račun: ${service.invoiceNumber}`}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onExportServiceSlip(service)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors shadow-2xs"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>Potvrda o servisu (PDF)</span>
                          </button>

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

      {/* Danger Zone: Delete Vehicle */}
      <div className="mt-12 p-4 rounded-2xl bg-slate-100 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brisanje vozila iz garaže</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Trajno briše ovo vozilo i sve povezane servisne zapise iz evidencije. Ova akcija je nepovratna.
          </p>
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Jeste li sigurni?</span>
            <button
              onClick={onDeleteVehicle}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Da, obriši
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Odustani
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-white hover:bg-slate-900 border border-slate-300 rounded-xl transition-colors self-start sm:self-auto bg-white shadow-2xs"
          >
            Obriši vozilo
          </button>
        )}
      </div>
    </div>
  );
};
