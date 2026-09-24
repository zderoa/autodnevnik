import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Car, 
  Wrench, 
  CheckCircle2, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { ServiceReminder, Vehicle } from '../types';

interface RemindersViewProps {
  reminders: ServiceReminder[];
  vehicles: Vehicle[];
  onOpenAddService: (vehicleId: string) => void;
  onRenewRegistration: (vehicleId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  vehicles,
  onOpenAddService,
  onRenewRegistration,
  onSelectVehicle,
}) => {
  const [filter, setFilter] = useState<'all' | 'registration' | 'service'>('all');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'all') return true;
    return r.type === filter;
  });

  const overdueCount = reminders.filter((r) => r.isOverdue).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header - Gray Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-100 border border-slate-200/90 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-800" />
            Podsjetnici i rokovi održavanja
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Automatska upozorenja o isticanju registracije i intervalima za mali i veliki servis
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-semibold ${
              filter === 'all' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Svi ({reminders.length})
          </button>
          <button
            onClick={() => setFilter('registration')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-semibold ${
              filter === 'registration' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registracije
          </button>
          <button
            onClick={() => setFilter('service')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-semibold ${
              filter === 'service' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Servisi
          </button>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-slate-900 border border-slate-900 rounded-2xl text-white text-xs shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm text-white block">
              Pažnja: Imate {overdueCount} {overdueCount === 1 ? 'isteklu stavku' : 'istekle stavke'}!
            </strong>
            <p className="text-slate-300 mt-0.5">
              Registracija ili preporučeni servisni kilometri su prekoračeni. Preporučujemo hitno obnavljanje.
            </p>
          </div>
        </div>
      )}

      {/* Reminders List - Gray Cards */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 text-center bg-slate-100 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Sve je ažurno!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Nema aktivnih upozorenja za registraciju ili servise u narednih 45 dana. Vaša flota je uredno održavana.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((rem) => {
            return (
              <div
                key={rem.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                  rem.isOverdue
                    ? 'bg-slate-200/90 border-slate-400'
                    : rem.urgency === 'high'
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-slate-100 border-slate-200/90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      rem.isOverdue
                        ? 'bg-slate-900 text-white border border-slate-900'
                        : rem.urgency === 'high'
                        ? 'bg-white text-slate-900 border border-slate-300'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {rem.type === 'registration' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Wrench className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{rem.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          rem.isOverdue
                            ? 'bg-slate-900 text-white'
                            : rem.urgency === 'high'
                            ? 'bg-slate-300 text-slate-900'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {rem.isOverdue
                          ? 'Isteklo'
                          : rem.daysRemaining === 0
                          ? 'Danas'
                          : `za ${rem.daysRemaining} d.`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <button
                        onClick={() => onSelectVehicle(rem.vehicleId)}
                        className="font-bold text-slate-800 hover:text-slate-950 hover:underline flex items-center gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {rem.vehicleName}
                      </button>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-700 font-semibold">{rem.plate}</span>
                      {rem.dueDate && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1 font-mono text-slate-600 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Rok: {rem.dueDate}
                          </span>
                        </>
                      )}
                      {rem.dueMileage && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-slate-700 font-medium">
                            Na: {rem.dueMileage.toLocaleString()} km{' '}
                            {rem.kmRemaining !== undefined && (
                              <span className={rem.kmRemaining < 0 ? 'text-slate-950 font-bold' : 'text-slate-500'}>
                                ({rem.kmRemaining < 0 ? 'prekoračeno za ' + Math.abs(rem.kmRemaining).toLocaleString() : 'preostalo ' + rem.kmRemaining.toLocaleString()} km)
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {rem.type === 'registration' ? (
                    <button
                      type="button"
                      onClick={() => onRenewRegistration(rem.vehicleId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
                      title="Automatski pomjera datum registracije za 1 godinu"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Produži registraciju (+1 god)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAddService(rem.vehicleId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upiši servis</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
