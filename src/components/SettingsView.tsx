import React, { useState } from 'react';
import { 
  Settings, 
  User as UserIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  LogOut, 
  Check, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { User } from '../types';
import { CURRENCIES } from '../data/constants';
import { exportBackupJson, importBackupJson, resetToDemoData } from '../services/storage';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onReloadAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onReloadAllData,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [currency, setCurrency] = useState(user.settings.currency || 'EUR');
  const [reminderDays] = useState(user.settings.reminderDays || 30);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Ime i prezime ne može biti prazno.');
      return;
    }

    const updated: User = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      settings: {
        ...user.settings,
        currency,
        reminderDays: Number(reminderDays),
      },
    };

    onUpdateUser(updated);
    setSuccessMessage('Podešavanja su uspješno sačuvana!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoDnevnik_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        setSuccessMessage(res.message);
        onReloadAllData();
      } else {
        setErrorMessage(res.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Jeste li sigurni da želite vratiti podatke na početni demo uzorak? Svi trenutni podaci biće zamijenjeni demo podacima.')) {
      resetToDemoData();
      onReloadAllData();
      setSuccessMessage('Podaci su uspješno vraćeni na fabrički demo nalog.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header - Gray Card */}
      <div className="p-5 bg-slate-100 border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-800" />
            Podešavanja aplikacije i naloga
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Upravljajte ličnim profilom, podrazumijevanom valutom, podsjetnicima i rezervnim kopijama
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-900 border border-slate-900 text-white text-xs rounded-xl shadow-2xs font-semibold">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 bg-slate-200 border border-slate-400 text-slate-900 text-xs rounded-xl shadow-2xs font-semibold">
          <AlertCircle className="w-4 h-4 text-slate-900 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* User Profile Form - Gray Card */}
      <form onSubmit={handleSaveProfile} className="p-6 bg-slate-100 border border-slate-200/90 rounded-2xl space-y-5 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
          <UserIcon className="w-4 h-4 text-slate-800" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Korisnički profil</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ime i prezime</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email adresa (ID naloga)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 bg-slate-200/60 border border-slate-300/80 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kontakt telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+387..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Podrazumijevana valuta</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-800 shadow-2xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            <span>Nalog aktivan od: {new Date(user.createdAt).toLocaleDateString('bs-BA')}</span>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Sačuvaj izmjene</span>
          </button>
        </div>
      </form>

      {/* Backup and Data Management - Gray Card */}
      <div className="p-6 bg-slate-100 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
          <Download className="w-4 h-4 text-slate-800" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sigurnost podataka i kopije</h2>
        </div>

        <p className="text-xs text-slate-600">
          Svi vaši podaci (vozila, računi, servisi, kilometraža) se čuvaju u vašem lokalnom pretraživaču. Možete izvesti kompletnu rezervnu kopiju (JSON) ili prenijeti podatke na drugi uređaj.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Preuzmi rezervnu kopiju (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Učitaj kopiju (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleResetDemo}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Vrati na početni demo uzorak</span>
          </button>
        </div>
      </div>

      {/* Logout Session - Gray Card */}
      <div className="p-6 bg-slate-100 border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Odjava sa ovog uređaja</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Završite trenutnu korisničku sesiju. Možete se ponovo prijaviti u bilo kom trenutku.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 text-xs font-bold text-slate-800 hover:text-white bg-white hover:bg-slate-900 border border-slate-300 rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Odjavi se</span>
        </button>
      </div>
    </div>
  );
};
