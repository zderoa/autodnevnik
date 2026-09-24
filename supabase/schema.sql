-- ==========================================================
-- DIGITALNA SERVISNA KNJIŽICA - SUPABASE POSTGRESQL SCHEMA
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. KORISNIČKI PROFILI (Povezano sa Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  currency TEXT DEFAULT 'EUR' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. VOZILA (Flota / Garaža)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  generation TEXT,
  year INTEGER NOT NULL,
  plate TEXT NOT NULL,
  country TEXT DEFAULT 'BIH' NOT NULL,
  vin TEXT,
  engine_type TEXT,
  engine_displacement_cc INTEGER,
  power_kw INTEGER,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  body_type TEXT,
  color TEXT,
  current_mileage INTEGER DEFAULT 0 NOT NULL,
  registration_expiry DATE NOT NULL,
  custom_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indeksi za brže pretrage po korisniku i tablicama
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);

-- 4. SERVISNI ZAPISI (Istorija servisa)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  cost NUMERIC(10,2) DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'EUR' NOT NULL,
  servicer TEXT,
  invoice_number TEXT,
  categories TEXT[] DEFAULT '{}'::TEXT[],
  parts JSONB DEFAULT '[]'::JSONB,
  next_due_mileage INTEGER,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indeksi za servise
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON public.services(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_date ON public.services(date DESC);

-- 5. ROW LEVEL SECURITY (RLS) - Privatnost podataka svakog korisnika
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Politike za Profile
CREATE POLICY "Korisnik može pregledati svoj profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Korisnik može ažurirati svoj profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Korisnik može kreirati svoj profil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Politike za Vozila
CREATE POLICY "Korisnik ima puni pristup svojim vozilima"
  ON public.vehicles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politike za Servisne zapise
CREATE POLICY "Korisnik ima puni pristup svojim servisima"
  ON public.services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. AUTOMATSKO KREIRANJE PROFILA NAKON REGISTRACIJE (Supabase Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, currency)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Korisnik'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'EUR')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. TRIGGER ZA AUTOMATSKO AŽURIRANJE KILOMETRAŽE VOZILA PRI UNOSU NOVOG SERVISA
CREATE OR REPLACE FUNCTION public.update_vehicle_mileage_on_service()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vehicles
  SET 
    current_mileage = GREATEST(current_mileage, NEW.mileage),
    updated_at = NOW()
  WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_service_inserted ON public.services;
CREATE TRIGGER on_service_inserted
  AFTER INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_vehicle_mileage_on_service();
