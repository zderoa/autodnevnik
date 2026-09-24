import React, { useState, useEffect, useMemo } from 'react';
import { 
  getCurrentUser, 
  getVehicles, 
  getServices, 
  saveVehicle, 
  deleteVehicle, 
  saveService, 
  deleteService, 
  updateVehicleMileage, 
  calculateReminders, 
  logout, 
  updateUser 
} from './services/storage';
import { 
  exportServiceSlipPdf, 
  exportVehicleBookletPdf, 
  exportGarageReportPdf 
} from './services/pdfExport';
import { User, Vehicle, ServiceRecord, ServiceReminder } from './types';
import { Navbar } from './components/Navbar';
import { GarageView } from './components/GarageView';
import { VehicleDetailView } from './components/VehicleDetailView';
import { ServicesBookletView } from './components/ServicesBookletView';
import { AnalyticsView } from './components/AnalyticsView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { VehicleModal } from './components/VehicleModal';
import { ServiceModal } from './components/ServiceModal';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<string>('garage');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [serviceTargetVehicleId, setServiceTargetVehicleId] = useState<string | null>(null);

  // Toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load user and data on mount
  const refreshData = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const userVehicles = getVehicles(currentUser.id);
      setVehicles(userVehicles);

      // Load all services for this user's vehicles
      const allServices = getServices().filter((s) => s.userId === currentUser.id);
      setServices(allServices);

      // If selected vehicle no longer exists, reset
      if (selectedVehicleId && !userVehicles.some((v) => v.id === selectedVehicleId)) {
        setSelectedVehicleId(null);
      }
    } else {
      setVehicles([]);
      setServices([]);
      setSelectedVehicleId(null);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute live reminders
  const reminders: ServiceReminder[] = useMemo(() => {
    if (!user) return [];
    return calculateReminders(user.id);
  }, [user, vehicles, services]);

  // Selected vehicle reference
  const currentSelectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Auth handlers
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    refreshData();
    showToast(`Dobrodošli, ${authenticatedUser.name}!`);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setVehicles([]);
    setServices([]);
    setSelectedVehicleId(null);
    setActiveTab('garage');
    showToast('Uspješno ste se odjavili.');
  };

  // Vehicle actions
  const handleOpenAddVehicle = () => {
    if (!user) {
      setAuthModalMode('register');
      setAuthModalOpen(true);
      return;
    }
    setEditingVehicle(null);
    setVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (v?: Vehicle) => {
    const target = v || currentSelectedVehicle;
    if (target) {
      setEditingVehicle(target);
      setVehicleModalOpen(true);
    }
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'> & { id?: string }) => {
    const saved = saveVehicle(vehicleData);
    refreshData();
    showToast(vehicleData.id ? 'Podaci o vozilu su ažurirani.' : 'Novo vozilo je uspješno dodano u garažu!');
    setSelectedVehicleId(saved.id);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    deleteVehicle(vehicleId);
    refreshData();
    setSelectedVehicleId(null);
    showToast('Vozilo i svi povezani servisi su obrisani.');
  };

  const handleUpdateMileage = (vehicleId: string, newMileage: number) => {
    updateVehicleMileage(vehicleId, newMileage);
    refreshData();
    showToast(`Kilometraža ažurirana na ${newMileage.toLocaleString()} km.`);
  };

  const handleRenewRegistration = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    if (!v) return;

    // Advance regDate by 1 year
    const curDate = v.regDate ? new Date(v.regDate + 'T00:00:00') : new Date();
    curDate.setFullYear(curDate.getFullYear() + 1);
    const newRegDate = curDate.toISOString().slice(0, 10);

    saveVehicle({
      ...v,
      regDate: newRegDate,
    });
    refreshData();
    showToast(`Registracija za ${v.customName || v.brand} je produžena (+1 godina).`);
  };

  // Service actions
  const handleOpenAddService = (vehicleId?: string) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (vehicles.length === 0) {
      showToast('Prvo dodajte vozilo u garažu da biste upisali servis.', 'error');
      setEditingVehicle(null);
      setVehicleModalOpen(true);
      return;
    }

    setEditingService(null);
    setServiceTargetVehicleId(vehicleId || selectedVehicleId || vehicles[0]?.id || null);
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceRecord) => {
    setEditingService(service);
    setServiceTargetVehicleId(service.vehicleId);
    setServiceModalOpen(true);
  };

  const handleSaveService = (serviceData: Omit<ServiceRecord, 'id' | 'createdAt'> & { id?: string }) => {
    saveService(serviceData);
    refreshData();
    showToast(serviceData.id ? 'Servisni unos je izmijenjen.' : 'Servis je uspješno upisan u knjižicu!');
  };

  const handleDeleteService = (serviceId: string) => {
    deleteService(serviceId);
    refreshData();
    showToast('Servisni unos je obrisan.');
  };

  // PDF Exports
  const handleExportSlip = (service: ServiceRecord, vehicle: Vehicle) => {
    exportServiceSlipPdf(vehicle, service, user?.settings.currency || 'EUR');
    showToast('Generisan je PDF sertifikat servisa.');
  };

  const handleExportBooklet = (vehicle: Vehicle) => {
    const vServices = services.filter((s) => s.vehicleId === vehicle.id);
    exportVehicleBookletPdf(vehicle, vServices, user?.settings.currency || 'EUR');
    showToast('Generisana je digitalna servisna knjižica (PDF).');
  };

  const handleExportGarageReport = () => {
    if (!user) return;
    exportGarageReportPdf(user, vehicles, services);
    showToast('Generisan je kompletan flotni PDF izvještaj.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-bold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-slate-950 text-white border-slate-800'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'garage') {
            setSelectedVehicleId(null);
          }
        }}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={(id) => {
          setSelectedVehicleId(id);
          setActiveTab('garage');
        }}
        remindersCount={reminders.length}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAddVehicle={handleOpenAddVehicle}
        onOpenAddService={() => handleOpenAddService()}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          /* Unauthenticated Landing / Invitation View */
          <div className="py-12 sm:py-20 text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
              <span className="text-slate-900">✦</span>
              <span>Moderna elektronska servisna evidencija</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Vodite kompletnu servisnu knjižicu za svoja vozila online.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Zabilježite svaki mali i veliki servis, zamjene dijelova, troškove i primajte automatska upozorenja za registraciju i termine održavanja.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all hover:scale-105"
              >
                Kreirajte besplatan nalog
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
              >
                Prijava ili Demo prikaz
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Router */
          <>
            {activeTab === 'garage' && (
              currentSelectedVehicle ? (
                <VehicleDetailView
                  vehicle={currentSelectedVehicle}
                  services={services.filter((s) => s.vehicleId === currentSelectedVehicle.id)}
                  user={user}
                  onBack={() => setSelectedVehicleId(null)}
                  onEditVehicle={() => handleOpenEditVehicle(currentSelectedVehicle)}
                  onDeleteVehicle={() => handleDeleteVehicle(currentSelectedVehicle.id)}
                  onAddService={() => handleOpenAddService(currentSelectedVehicle.id)}
                  onEditService={handleOpenEditService}
                  onDeleteService={handleDeleteService}
                  onExportBooklet={() => handleExportBooklet(currentSelectedVehicle)}
                  onExportServiceSlip={(service) => handleExportSlip(service, currentSelectedVehicle)}
                  onUpdateMileage={(m) => handleUpdateMileage(currentSelectedVehicle.id, m)}
                />
              ) : (
                <GarageView
                  user={user}
                  vehicles={vehicles}
                  services={services}
                  onSelectVehicle={(id) => setSelectedVehicleId(id)}
                  onOpenAddVehicle={handleOpenAddVehicle}
                  onOpenAddService={handleOpenAddService}
                  onExportBooklet={handleExportBooklet}
                  onExportGarageReport={handleExportGarageReport}
                />
              )
            )}

            {activeTab === 'services' && (
              <ServicesBookletView
                vehicles={vehicles}
                services={services}
                user={user}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={(id) => setSelectedVehicleId(id)}
                onOpenAddService={handleOpenAddService}
                onEditService={handleOpenEditService}
                onDeleteService={handleDeleteService}
                onExportSlip={handleExportSlip}
                onExportBooklet={handleExportBooklet}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                vehicles={vehicles}
                services={services}
                user={user}
                onExportGarageReport={handleExportGarageReport}
              />
            )}

            {activeTab === 'reminders' && (
              <RemindersView
                reminders={reminders}
                vehicles={vehicles}
                onOpenAddService={handleOpenAddService}
                onRenewRegistration={handleRenewRegistration}
                onSelectVehicle={(id) => {
                  setSelectedVehicleId(id);
                  setActiveTab('garage');
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                onUpdateUser={(updated) => {
                  updateUser(updated);
                  setUser(updated);
                  showToast('Podešavanja profila su sačuvana.');
                }}
                onLogout={handleLogout}
                onReloadAllData={refreshData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 bg-slate-100/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AutoDnevnik © {new Date().getFullYear()} — Digitalna servisna evidencija za motorna vozila</span>
          <span className="font-mono text-[11px] text-slate-600 font-semibold">Verzija 2.5 Pro · Šifrovano lokalno čuvanje</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      <VehicleModal
        isOpen={vehicleModalOpen}
        onClose={() => {
          setVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        onSave={handleSaveVehicle}
        initialData={editingVehicle}
        userId={user?.id || ''}
      />

      {user && (
        <ServiceModal
          isOpen={serviceModalOpen}
          onClose={() => {
            setServiceModalOpen(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
          initialData={editingService}
          vehicles={vehicles}
          defaultVehicleId={serviceTargetVehicleId || selectedVehicleId}
          userId={user.id}
          defaultCurrency={user.settings.currency}
        />
      )}
    </div>
  );
}
