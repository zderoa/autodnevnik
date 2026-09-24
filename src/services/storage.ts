import { User, Vehicle, ServiceRecord, ServiceReminder } from '../types';

const STORAGE_KEYS = {
  USERS: 'autodnevnik_users_v2',
  CURRENT_USER_ID: 'autodnevnik_session_user_id_v2',
  VEHICLES: 'autodnevnik_vehicles_v2',
  SERVICES: 'autodnevnik_services_v2',
};

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// Initial Demo Seed Data
const DEMO_USER: User = {
  id: 'usr_demo_88',
  name: 'Marko Petrović',
  email: 'demo@autodnevnik.ba',
  password: 'demo',
  phone: '+387 65 123 456',
  avatarUrl: '',
  createdAt: '2024-01-15T10:00:00Z',
  settings: {
    currency: 'EUR',
    distanceUnit: 'km',
    reminderDays: 30,
    darkMode: true,
  },
};

const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'veh_golf7_01',
    userId: 'usr_demo_88',
    type: 'automobil',
    brand: 'Volkswagen',
    model: 'Golf 7 2.0 TDI Highline',
    customName: 'Sivi Golf 7',
    year: 2018,
    fuelType: 'Dizel',
    bodyType: 'Hečbek (Hatchback)',
    cc: 1968,
    kw: 110,
    hp: 150,
    transmission: 'Automatski (DSG/S-tronic/Steptronic)',
    drivetrain: 'Prednji pogon (FWD)',
    vin: 'WVWZZZAUZJP189421',
    plate: 'A24-O-891',
    country: 'BIH',
    currentMileage: 182450,
    regDate: '2025-10-14',
    insuranceCompany: 'Sarajevo Osiguranje d.d.',
    color: 'Siva metalik (Indium Grey)',
    notes: 'Kupljen sa 138.000 km iz uvoza (Njemačka). Uredna servisna istorija, garažiran.',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'veh_bmw_02',
    userId: 'usr_demo_88',
    type: 'automobil',
    brand: 'BMW',
    model: 'Serija 3 (F30) 320d xDrive M-Sport',
    customName: 'Crna Trojka',
    year: 2017,
    fuelType: 'Dizel',
    bodyType: 'Limuzina',
    cc: 1995,
    kw: 140,
    hp: 190,
    transmission: 'Automatski (DSG/S-tronic/Steptronic)',
    drivetrain: 'Pogon na sve točkove (AWD / 4x4)',
    vin: 'WBA3D31000F982103',
    plate: 'BG-1492-MK',
    country: 'SRB',
    currentMileage: 149800,
    regDate: '2025-05-20',
    insuranceCompany: 'Dunav Osiguranje',
    color: 'Crna safir metalik',
    notes: 'Originalan M Sport paket, navigacija Professional, LED adaptivna svjetla.',
    createdAt: '2024-04-10T12:00:00Z',
  },
];

const DEMO_SERVICES: ServiceRecord[] = [
  // Golf 7 Services
  {
    id: 'srv_g7_01',
    vehicleId: 'veh_golf7_01',
    userId: 'usr_demo_88',
    type: 'mali_servis',
    title: 'Redovni mali servis (Castrol 5W-30 + MANN filteri)',
    date: '2025-08-12',
    mileage: 178200,
    servicer: 'Auto Servis VAG Specijalist',
    servicerCity: 'Sarajevo',
    servicerPhone: '+387 33 555 120',
    cost: 145,
    currency: 'EUR',
    invoiceNumber: 'RN-2025/0842',
    categories: ['Zamjena motornog ulja', 'Zamjena filtera ulja', 'Zamjena filtera zraka', 'Zamjena filtera kabine (polen filter)'],
    parts: [
      { id: 'p1', name: 'Castrol Edge 5W-30 LL (5L)', brand: 'Castrol', quantity: 1, price: 65 },
      { id: 'p2', name: 'Filter ulja HU 7020 z', brand: 'MANN', quantity: 1, price: 14 },
      { id: 'p3', name: 'Filter zraka C 30 005', brand: 'MANN', quantity: 1, price: 18 },
      { id: 'p4', name: 'Filter kabine s aktivnim ugljem FP 26 009', brand: 'FreciousPlus', quantity: 1, price: 23 },
    ],
    notes: 'Pregledan kompletan trap i kočnice, sve u odličnom stanju. Ulje zamijenjeno na 178.200 km.',
    nextDueMileage: 193200,
    nextDueDate: '2026-08-12',
    createdAt: '2025-08-12T16:00:00Z',
  },
  {
    id: 'srv_g7_02',
    vehicleId: 'veh_golf7_01',
    userId: 'usr_demo_88',
    type: 'kocnice_ovjes',
    title: 'Zamjena prednjih diskova i pločica (ATE)',
    date: '2025-03-05',
    mileage: 171400,
    servicer: 'Bremse Pro Centar',
    servicerCity: 'Sarajevo',
    cost: 210,
    currency: 'EUR',
    invoiceNumber: 'RN-2025/0219',
    categories: ['Zamjena prednjih kočionih pločica', 'Zamjena kočionih diskova', 'Zamjena kočionog ulja (DOT4/DOT5.1)'],
    parts: [
      { id: 'p5', name: 'Prednji kočioni diskovi 312mm', brand: 'ATE Original', quantity: 2, price: 130 },
      { id: 'p6', name: 'Prednje kočione pločice Ceramic', brand: 'ATE Ceramic', quantity: 1, price: 65 },
      { id: 'p7', name: 'Kočiona tečnost DOT4 SL.6 (1L)', brand: 'ATE', quantity: 1, price: 15 },
    ],
    notes: 'Kočioni sistem ispran i ozračen. Pedala stabilna, bez vibracija.',
    nextDueMileage: 210000,
    nextDueDate: '2027-03-05',
    createdAt: '2025-03-05T14:30:00Z',
  },
  {
    id: 'srv_g7_03',
    vehicleId: 'veh_golf7_01',
    userId: 'usr_demo_88',
    type: 'veliki_servis',
    title: 'Kompletan veliki servis (Zupčasti set + vodena pumpa + Continental)',
    date: '2024-09-18',
    mileage: 162000,
    servicer: 'VAG Servis Centar',
    servicerCity: 'Sarajevo',
    servicerPhone: '+387 33 222 999',
    cost: 480,
    currency: 'EUR',
    invoiceNumber: 'VAG-16200-VS',
    categories: [
      'Zamjena zupčastog kaiša / pogonskog lanca',
      'Zamjena španera i rolera',
      'Zamjena vodene pumpe',
      'Zamjena PK kaiša i zatezača',
      'Zamjena rashladne tečnosti (antifriz)',
    ],
    parts: [
      { id: 'p8', name: 'Set zupčastog kaiša sa vodenom pumpom CT1168WP1', brand: 'Continental ContiTech', quantity: 1, price: 240 },
      { id: 'p9', name: 'Kanalni PK remen 6PK1070 + španer', brand: 'Gates', quantity: 1, price: 75 },
      { id: 'p10', name: 'Antifriz G13 koncentrat (3L) + destilovana voda', brand: 'Febi Bilstein', quantity: 1, price: 25 },
    ],
    notes: 'Zamijenjen originalni set zupčastog remena. Sljedeći veliki servis preporučen na 250.000 km ili za 5 godina.',
    nextDueMileage: 250000,
    nextDueDate: '2029-09-18',
    createdAt: '2024-09-18T18:00:00Z',
  },
  {
    id: 'srv_g7_04',
    vehicleId: 'veh_golf7_01',
    userId: 'usr_demo_88',
    type: 'klima',
    title: 'Dezinfekcija i punjenje klima uređaja',
    date: '2024-06-10',
    mileage: 156300,
    servicer: 'Klima Auto Express',
    servicerCity: 'Sarajevo',
    cost: 55,
    currency: 'EUR',
    categories: ['Punjenje freona (R134a / R1234yf)', 'Ozonizacija i dezinfekcija ventilacionih kanala'],
    parts: [
      { id: 'p11', name: 'Freon R134a (500g) + PAG ulje', brand: 'Texa', quantity: 1, price: 40 },
      { id: 'p12', name: 'Ozon tretman kabine', brand: 'Ozone', quantity: 1, price: 15 },
    ],
    notes: 'Klima hladi na 4.8°C na izduvnim rešetkama. Nema neprijatnih mirisa.',
    nextDueDate: '2026-06-10',
    createdAt: '2024-06-10T11:00:00Z',
  },

  // BMW Services
  {
    id: 'srv_bmw_01',
    vehicleId: 'veh_bmw_02',
    userId: 'usr_demo_88',
    type: 'mali_servis',
    title: 'Redovni BMW Longlife-04 servis + svi filteri',
    date: '2025-04-12',
    mileage: 146000,
    servicer: 'Bimmer Servis Beograd',
    servicerCity: 'Beograd',
    servicerPhone: '+381 11 333 444',
    cost: 180,
    currency: 'EUR',
    invoiceNumber: 'BMR-2025-412',
    categories: ['Zamjena motornog ulja', 'Zamjena filtera ulja', 'Zamjena filtera zraka', 'Zamjena filtera goriva'],
    parts: [
      { id: 'p13', name: 'BMW TwinPower Turbo 5W-30 LL-04 (6L)', brand: 'BMW Original', quantity: 1, price: 85 },
      { id: 'p14', name: 'Filter ulja i brtve', brand: 'Mahle', quantity: 1, price: 18 },
      { id: 'p15', name: 'Filter zraka', brand: 'Mahle', quantity: 1, price: 26 },
      { id: 'p16', name: 'Filter goriva s grijačem', brand: 'Mahle', quantity: 1, price: 38 },
    ],
    notes: 'Elektronska knjižica u iDrive računaru upisana. Sljedeći servis za 15.000 km.',
    nextDueMileage: 161000,
    nextDueDate: '2026-04-12',
    createdAt: '2025-04-12T13:00:00Z',
  },
  {
    id: 'srv_bmw_02',
    vehicleId: 'veh_bmw_02',
    userId: 'usr_demo_88',
    type: 'mjenjac',
    title: 'Ispiranje i servis automatskog mjenjača ZF 8HP',
    date: '2024-11-20',
    mileage: 139000,
    servicer: 'ZF Automatic Centar',
    servicerCity: 'Beograd',
    cost: 380,
    currency: 'EUR',
    invoiceNumber: 'ZF-8HP-991',
    categories: ['Zamjena ulja u manuelnom / automatskom mjenjaču', 'Zamjena filtera automatskog mjenjača', 'Ispiranje automatske transmisije'],
    parts: [
      { id: 'p17', name: 'Karter mjenjača sa integrisanim filterom ZF', brand: 'ZF Lifeguard', quantity: 1, price: 120 },
      { id: 'p18', name: 'Ulje za mjenjač ZF LifeguardFluid 8 (9L)', brand: 'ZF', quantity: 1, price: 190 },
    ],
    notes: 'Dinamička zamjena ulja na aparatu pod pritiskom. Mjenjač šalta glatko i neprimijetno.',
    nextDueMileage: 200000,
    nextDueDate: '2028-11-20',
    createdAt: '2024-11-20T17:00:00Z',
  },
];

// Helper to seed localStorage if empty
function initializeStorageIfEmpty(): void {
  if (typeof window === 'undefined') return;

  const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersRaw) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEMO_USER]));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEMO_VEHICLES));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEMO_SERVICES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, DEMO_USER.id);
  }
}

// Ensure init
initializeStorageIfEmpty();

// --- Auth and User Management ---

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
}

export function getCurrentUser(): User | null {
  try {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = getUsers();
    return users.find((u) => u.id === currentId) || null;
  } catch {
    return null;
  }
}

export function setCurrentUser(userId: string | null): void {
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
}

export function registerUser(params: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  currency?: string;
}): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'Korisnički nalog sa ovom email adresom već postoji.' };
  }

  const newUser: User = {
    id: 'usr_' + uid(),
    name: params.name.trim(),
    email: normalizedEmail,
    password: params.password || 'password',
    phone: params.phone?.trim() || '',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    settings: {
      currency: params.currency || 'EUR',
      distanceUnit: 'km',
      reminderDays: 30,
      darkMode: true,
    },
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  setCurrentUser(newUser.id);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'Nalog sa unesenom email adresom nije pronađen.' };
  }

  // If password provided and user has password, check
  if (password && user.password && user.password !== password) {
    return { success: false, error: 'Pogrešna lozinka. Pokušajte ponovo.' };
  }

  setCurrentUser(user.id);
  return { success: true, user };
}

export function updateUser(updated: User): void {
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function logout(): void {
  setCurrentUser(null);
}

// Quick demo login
export function loginAsDemo(): User {
  const users = getUsers();
  let demo = users.find((u) => u.id === DEMO_USER.id);
  if (!demo) {
    demo = DEMO_USER;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([...users, DEMO_USER]));
  }
  setCurrentUser(demo.id);
  return demo;
}

// --- Vehicles Management ---

export function getVehicles(userId?: string): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    const list: Vehicle[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return list.filter((v) => v.userId === userId);
    }
    return list;
  } catch {
    return [];
  }
}

export function getVehicleById(vehicleId: string): Vehicle | null {
  const vehicles = getVehicles();
  return vehicles.find((v) => v.id === vehicleId) || null;
}

export function saveVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt'> & { id?: string }): Vehicle {
  const all = getVehicles();
  const now = new Date().toISOString();

  if (vehicle.id) {
    const existingIndex = all.findIndex((v) => v.id === vehicle.id);
    if (existingIndex >= 0) {
      const updated: Vehicle = {
        ...all[existingIndex],
        ...vehicle,
        id: vehicle.id,
      };
      all[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(all));
      return updated;
    }
  }

  const newVehicle: Vehicle = {
    ...vehicle,
    id: 'veh_' + uid(),
    createdAt: now,
  };

  const updatedAll = [newVehicle, ...all];
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedAll));
  return newVehicle;
}

export function deleteVehicle(vehicleId: string): void {
  const vehicles = getVehicles().filter((v) => v.id !== vehicleId);
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));

  // Also remove service records associated with this vehicle
  const services = getServices().filter((s) => s.vehicleId !== vehicleId);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

// Update current mileage of vehicle
export function updateVehicleMileage(vehicleId: string, newMileage: number): void {
  const vehicles = getVehicles().map((v) => {
    if (v.id === vehicleId && newMileage > v.currentMileage) {
      return { ...v, currentMileage: newMileage };
    }
    return v;
  });
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
}

// --- Services Management ---

export function getServices(vehicleId?: string): ServiceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    const list: ServiceRecord[] = raw ? JSON.parse(raw) : [];
    if (vehicleId) {
      return list.filter((s) => s.vehicleId === vehicleId).sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}

export function getServiceById(serviceId: string): ServiceRecord | null {
  const services = getServices();
  return services.find((s) => s.id === serviceId) || null;
}

export function saveService(service: Omit<ServiceRecord, 'id' | 'createdAt'> & { id?: string }): ServiceRecord {
  const all = getServices();
  const now = new Date().toISOString();

  if (service.id) {
    const existingIndex = all.findIndex((s) => s.id === service.id);
    if (existingIndex >= 0) {
      const updated: ServiceRecord = {
        ...all[existingIndex],
        ...service,
        id: service.id,
      };
      all[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(all));

      // Auto update vehicle current odometer if service mileage is higher
      if (service.vehicleId && service.mileage) {
        updateVehicleMileage(service.vehicleId, service.mileage);
      }
      return updated;
    }
  }

  const newService: ServiceRecord = {
    ...service,
    id: 'srv_' + uid(),
    createdAt: now,
  };

  const updatedAll = [newService, ...all];
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updatedAll));

  // Auto update vehicle current odometer if service mileage is higher
  if (service.vehicleId && service.mileage) {
    updateVehicleMileage(service.vehicleId, service.mileage);
  }

  return newService;
}

export function deleteService(serviceId: string): void {
  const services = getServices().filter((s) => s.id !== serviceId);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
}

// --- Reminders & Notifications ---

export function calculateReminders(userId: string): ServiceReminder[] {
  const vehicles = getVehicles(userId);
  const reminders: ServiceReminder[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const v of vehicles) {
    const vTitle = v.customName || `${v.brand} ${v.model}`;

    // 1. Registration Reminder
    if (v.regDate) {
      const regD = new Date(v.regDate + 'T00:00:00');
      // Registration is valid for 1 year from regDate
      const expiry = new Date(regD);
      expiry.setFullYear(expiry.getFullYear() + 1);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 45) {
        const isOverdue = diffDays < 0;
        reminders.push({
          id: `rem_reg_${v.id}`,
          vehicleId: v.id,
          vehicleName: vTitle,
          plate: v.plate,
          type: 'registration',
          title: isOverdue
            ? `Registracija je istekla prije ${Math.abs(diffDays)} dana!`
            : diffDays === 0
            ? 'Registracija ističe danas!'
            : `Registracija ističe za ${diffDays} dana`,
          dueDate: expiry.toISOString().slice(0, 10),
          daysRemaining: diffDays,
          isOverdue,
          urgency: diffDays <= 7 ? 'high' : diffDays <= 20 ? 'medium' : 'low',
        });
      }
    }

    // 2. Next Service Reminders (from last service records)
    const services = getServices(v.id);
    for (const s of services) {
      if (s.nextDueDate || s.nextDueMileage) {
        let daysRem = 999;
        let kmRem = undefined;
        let isOverdue = false;

        if (s.nextDueDate) {
          const nextDate = new Date(s.nextDueDate + 'T00:00:00');
          daysRem = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        if (s.nextDueMileage && v.currentMileage) {
          kmRem = s.nextDueMileage - v.currentMileage;
        }

        if (daysRem < 0 || (kmRem !== undefined && kmRem < 0)) {
          isOverdue = true;
        }

        // Trigger reminder if due within 30 days or within 1500 km, or overdue
        if (isOverdue || daysRem <= 35 || (kmRem !== undefined && kmRem <= 1500)) {
          reminders.push({
            id: `rem_srv_${s.id}`,
            vehicleId: v.id,
            vehicleName: vTitle,
            plate: v.plate,
            type: 'service',
            title: isOverdue
              ? `Planirani servis je istekao (${s.title})`
              : `Nadolazeći servis: ${s.title}`,
            dueDate: s.nextDueDate || '',
            daysRemaining: daysRem === 999 ? 0 : daysRem,
            dueMileage: s.nextDueMileage,
            kmRemaining: kmRem,
            isOverdue,
            urgency: isOverdue || daysRem <= 7 || (kmRem !== undefined && kmRem <= 500) ? 'high' : 'medium',
          });
          // One service reminder per vehicle is enough to keep it actionable
          break;
        }
      }
    }
  }

  return reminders.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.daysRemaining - b.daysRemaining;
  });
}

// Backup and restore
export function exportBackupJson(): string {
  const data = {
    users: getUsers(),
    vehicles: getVehicles(),
    services: getServices(),
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.vehicles || !Array.isArray(parsed.vehicles)) {
      return { success: false, message: 'Neispravan format rezervne kopije.' };
    }

    if (parsed.users && Array.isArray(parsed.users)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.users));
    }
    if (parsed.vehicles) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(parsed.vehicles));
    }
    if (parsed.services && Array.isArray(parsed.services)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(parsed.services));
    }

    return { success: true, message: 'Podaci su uspješno vraćeni iz rezervne kopije!' };
  } catch (err) {
    return { success: false, message: 'Došlo je do greške prilikom čitanja datoteke.' };
  }
}

export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEMO_USER]));
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEMO_VEHICLES));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEMO_SERVICES));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, DEMO_USER.id);
}
