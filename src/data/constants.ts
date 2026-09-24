import { VehicleType, ServiceType, FuelType } from '../types';

export const VEHICLE_TYPES: { id: VehicleType; label: string; icon: string }[] = [
  { id: 'automobil', label: 'Putnički automobil', icon: 'Car' },
  { id: 'motor', label: 'Motocikl / Skuter', icon: 'Bike' },
  { id: 'kombi', label: 'Kombi / Dostavno', icon: 'Truck' },
  { id: 'kamion', label: 'Kamion / Teretno', icon: 'Truck' },
  { id: 'autobus', label: 'Autobus / Minibus', icon: 'Bus' },
];

export const FUEL_TYPES: FuelType[] = [
  'Dizel',
  'Benzin',
  'Hibrid',
  'Benzin + Gas (LPG)',
  'Električni',
];

export const COUNTRIES = [
  { code: 'BIH', name: 'Bosna i Hercegovina', flag: '🇧🇦' },
  { code: 'SRB', name: 'Srbija', flag: '🇷🇸' },
  { code: 'HR', name: 'Hrvatska', flag: '🇭🇷' },
  { code: 'MNE', name: 'Crna Gora', flag: '🇲🇪' },
  { code: 'SLO', name: 'Slovenija', flag: '🇸🇮' },
  { code: 'D', name: 'Njemačka (D)', flag: '🇩🇪' },
  { code: 'A', name: 'Austrija (A)', flag: '🇦🇹' },
  { code: 'CH', name: 'Švajcarska (CH)', flag: '🇨🇭' },
  { code: 'EU', name: 'Ostalo / EU', flag: '🇪🇺' },
];

export const CURRENCIES = ['EUR', 'BAM', 'RSD', 'USD', 'CHF'];

export const SERVICE_TYPE_CONFIG: Record<
  ServiceType,
  { label: string; badgeColor: string; iconName: string; defaultMileageInterval: number; defaultMonthsInterval: number }
> = {
  mali_servis: {
    label: 'Mali servis (ulje i filteri)',
    badgeColor: 'emerald',
    iconName: 'Droplet',
    defaultMileageInterval: 15000,
    defaultMonthsInterval: 12,
  },
  veliki_servis: {
    label: 'Veliki servis (remen/lanac + pumpa)',
    badgeColor: 'amber',
    iconName: 'Cog',
    defaultMileageInterval: 60000,
    defaultMonthsInterval: 60,
  },
  kocnice_ovjes: {
    label: 'Kočioni sistem i ovjes',
    badgeColor: 'rose',
    iconName: 'ShieldAlert',
    defaultMileageInterval: 30000,
    defaultMonthsInterval: 24,
  },
  klima: {
    label: 'Klima uređaj i dezinfekcija',
    badgeColor: 'cyan',
    iconName: 'Wind',
    defaultMileageInterval: 20000,
    defaultMonthsInterval: 12,
  },
  mjenjac: {
    label: 'Servis mjenjača i kvačila',
    badgeColor: 'indigo',
    iconName: 'Layers',
    defaultMileageInterval: 60000,
    defaultMonthsInterval: 48,
  },
  gume: {
    label: 'Gume, felge i trap',
    badgeColor: 'orange',
    iconName: 'Disc',
    defaultMileageInterval: 15000,
    defaultMonthsInterval: 6,
  },
  akumulator: {
    label: 'Akumulator i elektrika',
    badgeColor: 'yellow',
    iconName: 'Zap',
    defaultMileageInterval: 40000,
    defaultMonthsInterval: 36,
  },
  vanredni_kvar: {
    label: 'Vanredna popravka / Dijagnostika',
    badgeColor: 'red',
    iconName: 'Wrench',
    defaultMileageInterval: 0,
    defaultMonthsInterval: 0,
  },
  ostalo: {
    label: 'Ostali radovi i održavanje',
    badgeColor: 'slate',
    iconName: 'FileText',
    defaultMileageInterval: 0,
    defaultMonthsInterval: 0,
  },
};

export const COMMON_SERVICE_CHECKLISTS: Record<ServiceType, string[]> = {
  mali_servis: [
    'Zamjena motornog ulja',
    'Zamjena filtera ulja',
    'Zamjena filtera zraka',
    'Zamjena filtera kabine (polen filter)',
    'Zamjena filtera goriva',
    'Provjera nivoa rashladne tečnosti (antifriz)',
    'Provjera nivoa tečnosti za kočnice',
    'Reset servisnog intervala na tabli',
  ],
  veliki_servis: [
    'Zamjena zupčastog kaiša / pogonskog lanca',
    'Zamjena španera i rolera',
    'Zamjena vodene pumpe',
    'Zamjena PK kaiša i zatezača',
    'Zamjena rashladne tečnosti (antifriz)',
    'Provjera zaptivki i semeringa radilice',
  ],
  kocnice_ovjes: [
    'Zamjena prednjih kočionih pločica',
    'Zamjena zadnjih kočionih pločica',
    'Zamjena kočionih diskova',
    'Zamjena kočionog ulja (DOT4/DOT5.1)',
    'Provjera kočionih crijeva i čeljusti',
    'Zamjena amortizera i opruga',
    'Zamjena kugli, krajnica i spona',
    'Provjera selen blokova i ležajeva točka',
  ],
  klima: [
    'Punjenje freona (R134a / R1234yf)',
    'Dodavanje ulja za kompresor klime i UV boje',
    'Zamjena filtera kabine sa aktivnim ugljem',
    'Ozonizacija i dezinfekcija ventilacionih kanala',
    'Provjera pritiska i rada kompresora',
  ],
  mjenjac: [
    'Zamjena ulja u manuelnom / automatskom mjenjaču',
    'Zamjena filtera automatskog mjenjača',
    'Zamjena seta kvačila (lamela, korpa, potisni)',
    'Zamjena plivajućeg zamajca',
    'Ispiranje automatske transmisije',
    'Provjera diferencijala i ulja mjenjača',
  ],
  gume: [
    'Sezonska zamjena guma (zima/ljeto)',
    'Balansiranje točkova',
    'Optika / geometrija trapa (reglaža)',
    'Provjera dubine šare i pritiska',
    'TPMS senzori pritiska kalibracija',
  ],
  akumulator: [
    'Ugradnja novog akumulatora',
    'Ispitivanje kapaciteta i startne struje',
    'Ispitivanje alternatora i punjenja',
    'Zamjena svjećica / grijača motora',
    'Provjera instalacije i osigurača',
  ],
  vanredni_kvar: [
    'Kompjuterska dijagnostika (OBD2)',
    'Popravka turbo punjača',
    'Čišćenje / regeneracija DPF filtera',
    'Popravka dizni / injektora',
    'Zamjena alternatora ili anlasera',
    'Zamjena lambda sonde / EGR ventila',
    'Popravka izduvnog sistema',
  ],
  ostalo: [
    'Zamjena metlica brisača',
    'Poliranje farova i zaštita',
    'Zaštita podvozja od korozije',
    'Zamjena tečnosti za stakla',
    'Dubinsko pranje i njega enterijera',
  ],
};

export const POPULAR_BRANDS = [
  'Volkswagen',
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Škoda',
  'Renault',
  'Peugeot',
  'Opel',
  'Ford',
  'Toyota',
  'Fiat',
  'Citroën',
  'Hyundai',
  'Kia',
  'Seat',
  'Volvo',
  'Dacia',
  'Mazda',
  'Nissan',
  'Honda',
  'Suzuki',
  'Alfa Romeo',
  'Land Rover',
  'Porsche',
  'Tesla',
  'Yamaha',
  'Kawasaki',
  'MAN',
  'Scania',
  'Iveco',
  'Ostalo',
];

export const BRAND_MODELS: Record<string, string[]> = {
  Volkswagen: ['Golf 7', 'Golf 8', 'Golf 6', 'Passat B8', 'Passat B7', 'Polo', 'Tiguan', 'Touran', 'Arteon', 'T-Roc', 'Caddy', 'Touareg'],
  Audi: ['A3', 'A4 B8', 'A4 B9', 'A6 C7', 'A6 C8', 'Q3', 'Q5', 'Q7', 'A5 Sportback', 'A1'],
  BMW: ['Serija 3 (F30)', 'Serija 3 (G20)', 'Serija 5 (F10)', 'Serija 5 (G30)', 'Serija 1 (F20)', 'X1', 'X3', 'X5'],
  'Mercedes-Benz': ['C-Klasa (W205)', 'E-Klasa (W213)', 'A-Klasa (W177)', 'GLC', 'GLA', 'CLA', 'Vito', 'Sprinter'],
  Škoda: ['Octavia A7', 'Octavia A8', 'Superb 3', 'Fabia', 'Kodiaq', 'Karoq', 'Kamiq', 'Rapid'],
  Renault: ['Clio 4', 'Clio 5', 'Megane 4', 'Talisman', 'Kadjar', 'Captur', 'Scenic', 'Trafic'],
  Peugeot: ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Boxer'],
  Opel: ['Astra J', 'Astra K', 'Insignia A', 'Insignia B', 'Corsa E', 'Corsa F', 'Mokka', 'Zafira'],
  Ford: ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Puma', 'Transit Custom'],
  Toyota: ['Corolla', 'Yaris', 'RAV4', 'C-HR', 'Auris', 'Avensis', 'Hilux'],
  Fiat: ['Punto', 'Tipo', '500', '500L', 'Panda', 'Ducato', 'Doblo'],
  Citroën: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'Jumper'],
  Hyundai: ['Tucson', 'i30', 'i20', 'Kona', 'Santa Fe', 'Elantra'],
  Kia: ['Sportage', 'Ceed', 'Rio', 'Sorento', 'XCeed', 'Stonic'],
  Seat: ['Leon', 'Ibiza', 'Ateca', 'Arona', 'Tarraco'],
  Volvo: ['XC60', 'XC90', 'V40', 'V60', 'V90', 'S60', 'S90'],
  Dacia: ['Duster', 'Sandero', 'Logan', 'Stepway', 'Jogger'],
  Mazda: ['3', '6', 'CX-5', 'CX-3', 'CX-30'],
  Nissan: ['Qashqai', 'Juke', 'X-Trail', 'Micra', 'Navara'],
  Honda: ['Civic', 'CR-V', 'Accord', 'HR-V'],
};

export const TRANSMISSIONS = ['Manuelni (Ručni)', 'Automatski (DSG/S-tronic/Steptronic)', 'Poluautomatski', 'CVT (Varijator)'];

export const DRIVETRAINS = ['Prednji pogon (FWD)', 'Zadnji pogon (RWD)', 'Pogon na sve točkove (AWD / 4x4)'];

export const BODY_TYPES: Record<VehicleType, string[]> = {
  automobil: ['Karavan', 'Limuzina', 'Hečbek (Hatchback)', 'SUV / Crossover', 'Kupe (Coupe)', 'Kabriolet', 'Monovolumen (MPV)', 'Pickup'],
  motor: ['Naked / Putni', 'Sportski', 'Enduro / Adventure', 'Skuter / Maxi skuter', 'Chopper / Cruiser', 'Turing'],
  kombi: ['Putnički', 'Teretni furgon', 'Kombinovani (teretno-putnički)', 'Hladnjača'],
  kamion: ['Tegljač / Šleper', 'Kiper', 'Furgon', 'Cisterna', 'Sa ceradom'],
  autobus: ['Turistički', 'Gradski', 'Prigradski', 'Minibus'],
};
