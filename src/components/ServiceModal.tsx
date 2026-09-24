import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wrench, 
  Droplet, 
  Cog, 
  ShieldAlert, 
  Wind, 
  Layers, 
  Disc, 
  Zap, 
  Plus, 
  Trash2, 
  Calendar, 
  Gauge, 
  Building2, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ServiceRecord, ServiceType, Vehicle, ServicePartItem } from '../types';
import { SERVICE_TYPE_CONFIG, COMMON_SERVICE_CHECKLISTS, CURRENCIES } from '../data/constants';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<ServiceRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: ServiceRecord | null;
  vehicles: Vehicle[];
  defaultVehicleId?: string | null;
  userId: string;
  defaultCurrency: string;
}

const uid = () => Math.random().toString(36).slice(2, 7);

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  vehicles,
  defaultVehicleId,
  userId,
  defaultCurrency,
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [type, setType] = useState<ServiceType>('mali_servis');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState<number>(0);
  const [servicer, setServicer] = useState('');
  const [servicerCity, setServicerCity] = useState('');
  const [servicerPhone, setServicerPhone] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [parts, setParts] = useState<ServicePartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [nextDueMileage, setNextDueMileage] = useState<number | undefined>(undefined);
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [autoCalculateNext, setAutoCalculateNext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVehicleId(initialData.vehicleId);
      setType(initialData.type);
      setTitle(initialData.title);
      setDate(initialData.date);
      setMileage(initialData.mileage);
      setServicer(initialData.servicer);
      setServicerCity(initialData.servicerCity || '');
      setServicerPhone(initialData.servicerPhone || '');
      setInvoiceNumber(initialData.invoiceNumber || '');
      setCost(initialData.cost);
      setCurrency(initialData.currency || defaultCurrency);
      setCategories(initialData.categories || []);
      setParts(initialData.parts || []);
      setNotes(initialData.notes || '');
      setNextDueMileage(initialData.nextDueMileage);
      setNextDueDate(initialData.nextDueDate || '');
      setAutoCalculateNext(false);
    } else {
      const selectedId = defaultVehicleId || (vehicles[0] ? vehicles[0].id : '');
      setVehicleId(selectedId);
      setType('mali_servis');
      setTitle(SERVICE_TYPE_CONFIG['mali_servis'].label);
      setDate(new Date().toISOString().slice(0, 10));
      
      const v = vehicles.find((item) => item.id === selectedId);
      const startMileage = v ? v.currentMileage : 150000;
      setMileage(startMileage);
      setServicer('VAG / Auto Servis');
      setServicerCity('');
      setServicerPhone('');
      setInvoiceNumber('');
      setCost(120);
      setCurrency(defaultCurrency);
      setCategories(COMMON_SERVICE_CHECKLISTS['mali_servis'].slice(0, 4));
      setParts([
        { id: uid(), name: 'Motorno ulje 5W-30 (5L)', brand: 'Castrol / Motul', quantity: 1, price: 65 },
        { id: uid(), name: 'Filter ulja', brand: 'MANN / Mahle', quantity: 1, price: 15 },
        { id: uid(), name: 'Filter zraka', brand: 'MANN', quantity: 1, price: 18 },
        { id: uid(), name: 'Filter kabine', brand: 'MANN', quantity: 1, price: 22 },
      ]);
      setNotes('');
      setAutoCalculateNext(true);

      setNextDueMileage(startMileage + SERVICE_TYPE_CONFIG['mali_servis'].defaultMileageInterval);
      const nextD = new Date();
      nextD.setFullYear(nextD.getFullYear() + 1);
      setNextDueDate(nextD.toISOString().slice(0, 10));
    }
    setError(null);
  }, [initialData, defaultVehicleId, isOpen, defaultCurrency]);

  const handleTypeChange = (newType: ServiceType) => {
    setType(newType);
    const cfg = SERVICE_TYPE_CONFIG[newType];
    setTitle(cfg.label);
    setCategories(COMMON_SERVICE_CHECKLISTS[newType].slice(0, 5));

    if (autoCalculateNext && cfg.defaultMileageInterval > 0) {
      setNextDueMileage(mileage + cfg.defaultMileageInterval);
      if (cfg.defaultMonthsInterval > 0) {
        const d = new Date(date + 'T00:00:00');
        d.setMonth(d.getMonth() + cfg.defaultMonthsInterval);
        setNextDueDate(d.toISOString().slice(0, 10));
      }
    }
  };

  const handleMileageChange = (newMileage: number) => {
    setMileage(newMileage);
    if (autoCalculateNext && SERVICE_TYPE_CONFIG[type].defaultMileageInterval > 0) {
      setNextDueMileage(newMileage + SERVICE_TYPE_CONFIG[type].defaultMileageInterval);
    }
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const addCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    if (!categories.includes(customCategoryInput.trim())) {
      setCategories([...categories, customCategoryInput.trim()]);
    }
    setCustomCategoryInput('');
  };

  const addPart = () => {
    setParts([...parts, { id: uid(), name: '', brand: '', quantity: 1, price: 0 }]);
  };

  const updatePart = (id: string, field: keyof ServicePartItem, value: any) => {
    const updated = parts.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    setParts(updated);

    const sum = updated.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    if (sum > 0) {
      setCost(sum);
    }
  };

  const removePart = (id: string) => {
    const updated = parts.filter((p) => p.id !== id);
    setParts(updated);
    const sum = updated.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    if (sum > 0) {
      setCost(sum);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError('Molimo izaberite vozilo za koje upisujete servis.');
      return;
    }
    if (!title.trim()) {
      setError('Unesite naslov ili opis servisa.');
      return;
    }
    if (!date) {
      setError('Unesite datum servisa.');
      return;
    }
    if (!mileage || mileage < 0) {
      setError('Unesite kilometražu na kojoj je servis obavljen.');
      return;
    }

    onSave({
      id: initialData?.id,
      vehicleId,
      userId,
      type,
      title: title.trim(),
      date,
      mileage: Number(mileage),
      servicer: servicer.trim() || 'Servis',
      servicerCity: servicerCity.trim() || undefined,
      servicerPhone: servicerPhone.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      cost: Number(cost) || 0,
      currency,
      categories,
      parts: parts.filter((p) => p.name.trim() !== ''),
      notes: notes.trim() || undefined,
      nextDueMileage: nextDueMileage ? Number(nextDueMileage) : undefined,
      nextDueDate: nextDueDate || undefined,
    });

    onClose();
  };

  const getServiceTypeIcon = (t: ServiceType) => {
    switch (t) {
      case 'mali_servis':
        return Droplet;
      case 'veliki_servis':
        return Cog;
      case 'kocnice_ovjes':
        return ShieldAlert;
      case 'klima':
        return Wind;
      case 'mjenjac':
        return Layers;
      case 'gume':
        return Disc;
      case 'akumulator':
        return Zap;
      default:
        return Wrench;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl my-6 bg-slate-100 border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {initialData ? 'Uredi servisni unos' : 'Upiši novi servis u evidenciju'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Zabilježite obavljene radove, ugrađene dijelove, troškove i termin sljedećeg servisa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-slate-200 border border-slate-400 text-slate-900 text-xs rounded-xl shadow-2xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-900" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Izaberi vozilo <span className="text-slate-900 font-bold">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.customName || `${v.brand} ${v.model}`} [{v.plate}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Naslov zapisa servisa <span className="text-slate-900 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="npr. Mali servis 5W-30 + svi filteri"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {/* Service Type Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Vrsta servisnog zahvata
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {(Object.keys(SERVICE_TYPE_CONFIG) as ServiceType[]).map((tKey) => {
                const isSelected = type === tKey;
                const Icon = getServiceTypeIcon(tKey);
                const itemCfg = SERVICE_TYPE_CONFIG[tKey];
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => handleTypeChange(tKey)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-2xs border-slate-900'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                    <span className="text-xs truncate">{itemCfg.label.split(' ')[0]} {itemCfg.label.split(' ')[1] || ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Mileage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Datum servisa <span className="text-slate-900 font-bold">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kilometraža na tabli (km) <span className="text-slate-900 font-bold">*</span>
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  required
                  value={mileage}
                  onChange={(e) => handleMileageChange(Number(e.target.value))}
                  placeholder="npr. 175000"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Checklist of operations */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stavke servisa & izvršene provjere
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {categories.length} označenih stavki
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {(COMMON_SERVICE_CHECKLISTS[type] || []).map((cat) => {
                const checked = categories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="w-3.5 h-3.5 rounded bg-white border-slate-300 text-slate-900 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate">{cat}</span>
                  </label>
                );
              })}
            </div>

            {/* Add custom checklist item */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Unesi dodatnu stavku (npr. Čišćenje EGR ventila)..."
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCategory();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl transition-colors shadow-2xs"
              >
                Dodaj
              </button>
            </div>
          </div>

          {/* Itemized Parts & Materials Table */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-slate-800" />
                Ugrađeni dijelovi i materijal
              </div>
              <button
                type="button"
                onClick={addPart}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Dodaj dio
              </button>
            </div>

            {parts.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                Nema unesenih pojedinačnih dijelova. Kliknite na "Dodaj dio" ako želite voditi specifikaciju.
              </div>
            ) : (
              <div className="space-y-2">
                {parts.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Naziv dijela (npr. Filter ulja)"
                        value={p.name}
                        onChange={(e) => updatePart(p.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 font-medium"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Proizvođač (npr. MANN)"
                        value={p.brand || ''}
                        onChange={(e) => updatePart(p.id, 'brand', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Kol."
                        value={p.quantity}
                        onChange={(e) => updatePart(p.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono text-center focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Cijena"
                        value={p.price || ''}
                        onChange={(e) => updatePart(p.id, 'price', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => removePart(p.id)}
                        className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workshop Details & Total Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servis / Mehaničar
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="npr. VAG Specijalist"
                  value={servicer}
                  onChange={(e) => setServicer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Broj računa / radnog naloga
              </label>
              <input
                type="text"
                placeholder="npr. RN-2025/112"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ukupan trošak servisa ({currency}) <span className="text-slate-900 font-bold">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Next Due Service Calculator */}
          <div className="p-4 bg-slate-200/50 border border-slate-300/80 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                Preporučeni interval za sljedeći servis
              </span>
              <span className="text-[11px] font-semibold text-slate-600">Automatski podsjetnik</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sljedeći servis na kilometraži (km)
                </label>
                <input
                  type="number"
                  min="0"
                  value={nextDueMileage || ''}
                  onChange={(e) => {
                    setNextDueMileage(e.target.value ? Number(e.target.value) : undefined);
                    setAutoCalculateNext(false);
                  }}
                  placeholder="npr. 195000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ili do datuma (najkasnije)
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => {
                    setNextDueDate(e.target.value);
                    setAutoCalculateNext(false);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Napomene servisera i detalji
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="npr. Provjerene kočione pločice, preporučena zamjena prednjih guma pred zimu..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 resize-none shadow-2xs"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Sačuvaj izmjene servisa' : 'Upiši servis u knjižicu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
