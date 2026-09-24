import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Shield, Mail, Lock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerUser, loginUser, loginAsDemo } from '../services/storage';
import { User as UserType } from '../types';
import { CURRENCIES } from '../data/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'register';
  isForced?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  isForced = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Molimo unesite email adresu i lozinku.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const result = loginUser(email, password);
        setLoading(false);
        if (result.success && result.user) {
          onSuccess(result.user);
          if (onClose) onClose();
        } else {
          setError(result.error || 'Neuspješna prijava.');
        }
      }, 300);
    } else {
      if (!name.trim()) {
        setError('Molimo unesite vaše ime i prezime.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Molimo unesite ispravnu email adresu.');
        return;
      }
      if (password.length < 4) {
        setError('Lozinka mora imati najmanje 4 karaktera.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Lozinke se ne poklapaju.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const result = registerUser({
          name,
          email,
          password,
          phone,
          currency,
        });
        setLoading(false);
        if (result.success && result.user) {
          onSuccess(result.user);
          if (onClose) onClose();
        } else {
          setError(result.error || 'Neuspješna registracija.');
        }
      }, 300);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const demoUser = loginAsDemo();
      setLoading(false);
      onSuccess(demoUser);
      if (onClose) onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-slate-100 border border-slate-200/90 rounded-3xl shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {mode === 'login' ? 'Prijava na nalog' : 'Registracija korisnika'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {mode === 'login'
                  ? 'Pristupite vašoj servisnoj knjižici i vozilima'
                  : 'Otvorite besplatan lični nalog za evidenciju'}
              </p>
            </div>
          </div>
          {!isForced && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-200/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Prijavi se
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Novi nalog
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Demo Access banner */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 text-slate-800">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Isprobaj odmah sa Demo nalogom
                  <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">1-klik</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Uključuje 2 vozila (Golf 7, BMW F30) sa unesenom servisnom istorijom
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
              Uđi →
            </span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 text-[11px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100">
              ili unesite podatke
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 text-xs bg-slate-200 border border-slate-400 rounded-xl text-slate-900 shadow-2xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-900 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ime i prezime <span className="text-slate-900 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Nikola Jovanović"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email adresa <span className="text-slate-900 font-bold">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="korisnik@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Broj telefona</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+387..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Podrazumijevana valuta</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-2xs font-semibold"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Lozinka <span className="text-slate-900 font-bold">*</span>
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Demo lozinka: <code className="text-slate-900 font-bold">demo</code>)
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Potvrdite lozinku <span className="text-slate-900 font-bold">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Prijavi se
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Kreiraj nalog
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              Nemate korisnički nalog?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-slate-900 hover:underline"
              >
                Registrujte se besplatno
              </button>
            </span>
          ) : (
            <span>
              Već imate registrovan nalog?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-slate-900 hover:underline"
              >
                Prijavite se ovdje
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
