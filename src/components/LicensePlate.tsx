import React from 'react';
import { COUNTRIES } from '../data/constants';

interface LicensePlateProps {
  plate: string;
  country?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LicensePlate: React.FC<LicensePlateProps> = ({
  plate,
  country = 'BIH',
  size = 'md',
  className = '',
}) => {
  const countryObj = COUNTRIES.find((c) => c.code === country) || { code: country || 'BIH', flag: '🚗' };

  const sizeClasses = {
    sm: 'h-6 text-xs px-1.5 gap-1 border-[1.5px]',
    md: 'h-8 text-sm px-2 gap-1.5 border-2',
    lg: 'h-10 text-base px-2.5 gap-2 border-2',
  };

  const blueBandClasses = {
    sm: 'w-4 text-[9px]',
    md: 'w-5 text-[10px]',
    lg: 'w-6 text-[11px]',
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded-md border-slate-900 bg-white text-slate-950 shadow-sm select-none ${sizeClasses[size]} ${className}`}
      title={`Registarska tablica (${countryObj.code})`}
    >
      {/* Country Stripe in monochrome palette */}
      <div
        className={`-ml-[1.5px] self-stretch flex flex-col items-center justify-center bg-slate-800 text-white font-sans font-bold rounded-l-[2px] ${blueBandClasses[size]}`}
      >
        <span className="leading-none text-[8px] opacity-90">★</span>
        <span className="leading-none font-bold tracking-tighter scale-90">{countryObj.code}</span>
      </div>

      {/* Plate text */}
      <span className="px-1 tracking-widest font-black uppercase whitespace-nowrap">
        {plate || 'BEZ TABLICA'}
      </span>
    </div>
  );
};
