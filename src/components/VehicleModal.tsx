import React, { useState, useEffect } from 'react';
import { X, Car, Bike, Truck, Bus, Check, Hash, Gauge, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleType, FuelType } from '../types';
import { 
  VEHICLE_TYPES, 
  POPULAR_BRANDS, 
  BRAND_MODELS, 
  FUEL_TYPES, 
  TRANSMISSIONS, 
  DRIVETRAINS, 
  BODY_TYPES, 
  COUNTRIES 
} from '../data/constants';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'createdAt'> & { id?: string }) => void;
  initialData?: Vehicle | null;
  userId: string;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  userId,
}) => {
  const [type, setType] = useState<VehicleType>('automobil');
  const [brand, setBrand] = useState('Volkswagen');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [customName, setCustomName] = useState('');
  const [year, setYear] = useState<number>(2019);
  const [fuelType, setFuelType] = useState<FuelType>('Dizel');
  const [bodyType, setBodyType] = useState('Limuzina');
  const [cc, setCc] = useState<number>(1968);
  const [kw, setKw] = useState<number>(110);
  const [hp, setHp] = useState<number>(150);
  const [transmission, setTransmission] = useState(TRANSMISSIONS[0]);
  const [drivetrain, setDrivetrain] = useState(DRIVETRAINS[0]);
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [country, setCountry] = useState('BIH');
  const [currentMileage, setCurrentMileage] = useState<number>(150000);
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'automobil');
      if (POPULAR_BRANDS.includes(initialData.brand)) {
        setBrand(initialData.brand);
        setCustomBrand('');
      } else {
        setBrand('Ostalo');
        setCustomBrand(initialData.brand);
      }
      setModel(initialData.model || '');
      setCustomName(initialData.customName || '');
      setYear(initialData.year || 2019);
      setFuelType(initialData.fuelType || 'Dizel');
      setBodyType(initialData.bodyType || 'Limuzina');
      setCc(initialData.cc || 1968);
      setKw(initialData.kw || 110);
      setHp(initialData.hp || 150);
      setTransmission(initialData.transmission || TRANSMISSIONS[0]);
      setDrivetrain(initialData.drivetrain || DRIVETRAINS[0]);
      setVin(initialData.vin || '');
      setPlate(initialData.plate || '');
      setCountry(initialData.country || 'BIH');
      setCurrentMileage(initialData.currentMileage || 0);
      setRegDate(initialData.regDate || new Date().toISOString().slice(0, 10));
      setInsuranceCompany(initialData.insuranceCompany || '');
      setColor(initialData.color || '');
      setNotes(initialData.notes || '');
    } else {
      setType('automobil');
      setBrand('Volkswagen');
      setCustomBrand('');
      setModel('');
      setCustomName('');
      setYear(2019);
      setFuelType('Dizel');
      setBodyType(BODY_TYPES['automobil'][0]);
      setCc(1968);
      setKw(110);
      setHp(150);
      setTransmission(TRANSMISSIONS[0]);
      setDrivetrain(DRIVETRAINS[0]);
      setVin('');
      setPlate('');
      setCountry('BIH');
      setCurrentMileage(150000);
      setRegDate(new Date().toISOString().slice(0, 10));
      setInsuranceCompany('');
      setColor('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleKwChange = (val: number) => {
    setKw(val);
    if (val > 0) {
      setHp(Math.round(val * 1.35962));
    }
  };

  const handleHpChange = (val: number) => {
    setHp(val);
    if (val > 0) {
      setKw(Math.round(val / 1.35962));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const actualBrand = brand === 'Ostalo' ? customBrand.trim() : brand;
    if (!actualBrand) {
      setError('Molimo unesite marku vozila.');
      return;
    }
    if (!model.trim()) {
      setError('Molimo unesite model vozila.');
      return;
    }
    if (!plate.trim()) {
      setError('Molimo unesite registarsku oznaku.');
      return;
    }
    if (!year || year < 1920 || year > 2030) {
      setError('Unesite validnu godinu proizvodnje.');
      return;
    }

    onSave({
      id: initialData?.id,
      userId,
      type,
      brand: actualBrand,
      model: model.trim(),
      customName: customName.trim() || undefined,
      year: Number(year),
      fuelType,
      bodyType,
      cc: Number(cc) || 0,
      kw: Number(kw) || 0,
      hp: Number(hp) || 0,
      transmission,
      drivetrain,
      vin: vin.trim().toUpperCase(),
      plate: plate.trim().toUpperCase(),
      country,
      currentMileage: Number(currentMileage) || 0,
      regDate,
      insuranceCompany: insuranceCompany.trim() || undefined,
      color: color.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const modelSuggestions = BRAND_MODELS[brand] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl my-6 bg-slate-100 border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {initialData ? 'Uredi podatke o vozilu' : 'Dodaj novo vozilo u garažu'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Popunite tehničke specifikacije za praćenje servisa i registracije
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl shadow-2xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle Type Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kategorija vozila
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {VEHICLE_TYPES.map((vt) => {
                const isSelected = type === vt.id;
                const IconComponent =
                  vt.id === 'automobil' ? Car : vt.id === 'motor' ? Bike : vt.id === 'kombi' ? Truck : vt.id === 'kamion' ? Truck : Bus;
                return (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => {
                      setType(vt.id);
                      setBodyType(BODY_TYPES[vt.id][0] || 'Standard');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-2xs border-slate-900'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mb-1.5" />
                    <span className="text-xs">{vt.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identification row: Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marka vozila <span className="text-rose-600">*</span>
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {brand === 'Ostalo' && (
                <input
                  type="text"
                  required
                  placeholder="Unesite naziv marke..."
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Model i oznaka <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                list="model-suggestions"
                placeholder="npr. Golf 7 2.0 TDI"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
              <datalist id="model-suggestions">
                {modelSuggestions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Custom Nickname & Fuel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vlastiti naziv / Nadimak (opciono)
              </label>
              <input
                type="text"
                placeholder="npr. Porodični karavan, Sivi Golf..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vrsta goriva</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Plates & Country */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              Registracija i identifikacija
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Država tablica</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Registarske tablice <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. A24-O-891"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Datum registracije
                </label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Broj šasije (VIN - 17 karaktera)
              </label>
              <input
                type="text"
                placeholder="WVWZZZ..."
                value={vin}
                maxLength={17}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono tracking-wider text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs font-semibold"
              />
            </div>
          </div>

          {/* Engine Specs & Mileage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Godina</label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kubikaža (ccm)</label>
              <input
                type="number"
                min="0"
                placeholder="1968"
                value={cc}
                onChange={(e) => setCc(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Snaga (kW)</label>
              <input
                type="number"
                min="0"
                placeholder="110"
                value={kw}
                onChange={(e) => handleKwChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Snaga (KS)</label>
              <input
                type="number"
                min="0"
                placeholder="150"
                value={hp}
                onChange={(e) => handleHpChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {/* Drivetrain, Transmission, Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Karoserija</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {BODY_TYPES[type].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mjenjač</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {TRANSMISSIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pogon</label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
              >
                {DRIVETRAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Odometer Mileage & Osiguranje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trenutna kilometraža (km)
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Osiguravajuća kuća (opciono)
              </label>
              <input
                type="text"
                placeholder="npr. Sarajevo Osiguranje, Dunav, Grawe..."
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dodatne bilješke ili istorija kupovine (opciono)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="npr. Uvezen iz Njemačke, prvi vlasnik na Balkanu, zamijenjen akumulator..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 resize-none shadow-2xs"
            />
          </div>

          {/* Footer Actions */}
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
              <Check className="w-4 h-4" />
              {initialData ? 'Sačuvaj izmjene' : 'Upiši vozilo u garažu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
