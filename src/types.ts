export type VehicleType = 'automobil' | 'motor' | 'kombi' | 'kamion' | 'autobus';

export type FuelType = 'Dizel' | 'Benzin' | 'Hibrid' | 'Benzin + Gas (LPG)' | 'Električni';

export type ServiceType = 
  | 'mali_servis' 
  | 'veliki_servis' 
  | 'kocnice_ovjes' 
  | 'klima' 
  | 'mjenjac' 
  | 'gume' 
  | 'akumulator' 
  | 'vanredni_kvar' 
  | 'ostalo';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  settings: {
    currency: string;
    distanceUnit: 'km' | 'mi';
    reminderDays: number;
    darkMode: boolean;
  };
}

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  brand: string;
  model: string;
  customName?: string;
  year: number;
  fuelType: FuelType;
  bodyType: string;
  cc: number;
  kw: number;
  hp: number;
  transmission: string;
  drivetrain: string;
  vin: string;
  plate: string;
  country: string;
  currentMileage: number;
  regDate: string; // YYYY-MM-DD
  insuranceCompany?: string;
  color?: string;
  notes?: string;
  createdAt: string;
}

export interface ServicePartItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  price: number;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  userId: string;
  type: ServiceType;
  title: string;
  date: string; // YYYY-MM-DD
  mileage: number;
  servicer: string;
  servicerPhone?: string;
  servicerCity?: string;
  cost: number;
  currency: string;
  invoiceNumber?: string;
  categories: string[];
  parts: ServicePartItem[];
  notes?: string;
  nextDueMileage?: number;
  nextDueDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plate: string;
  type: 'registration' | 'service' | 'custom';
  title: string;
  dueDate: string;
  daysRemaining: number;
  dueMileage?: number;
  kmRemaining?: number;
  isOverdue: boolean;
  urgency: 'high' | 'medium' | 'low';
}
