import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  User as UserIcon,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Cpu,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { User, UserRole } from '../types.ts';
import {
  ADMIN_SECRET_KEY,
  createNewUser,
  authenticateUser,
  determineRoleFromPassword,
} from '../utils/auth.ts';
import {
  checkPasswordUniqueness,
  analyzePasswordSecurity,
  getRateLimitState,
  recordFailedLoginAttempt,
  resetRateLimitState,
} from '../utils/security.ts';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  registeredUsers: User[];
  onRegisterUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  registeredUsers,
  onRegisterUser,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Monitor anti-brute-force lockout state
  useEffect(() => {
    const checkLockout = () => {
      const state = getRateLimitState();
      if (state.lockoutUntil) {
        const remaining = Math.max(0, Math.ceil((state.lockoutUntil - Date.now()) / 1000));
        setLockoutRemaining(remaining);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time security analysis
  const securityAnalysis = useMemo(() => {
    return analyzePasswordSecurity(password);
  }, [password]);

  // Real-time uniqueness validation
  const uniquenessResult = useMemo(() => {
    if (!password) return null;
    return checkPasswordUniqueness(password, registeredUsers);
  }, [password, registeredUsers]);

  if (!isOpen) return null;

  const isSecretAdminPassword = password.trim() === ADMIN_SECRET_KEY;
  const isLocked = lockoutRemaining > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      setError(`Sistema bloqueado temporalmente por seguridad. Espera ${lockoutRemaining} segundos.`);
      return;
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (mode === 'register') {
      if (!cleanUsername) {
        setError('Por favor ingresa un nombre de usuario');
        return;
      }
      if (!cleanPassword) {
        setError('Por favor ingresa una contraseña');
        return;
      }

      // Check if username already exists
      const usernameExists = registeredUsers.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (usernameExists) {
        setError('El nombre de usuario ya está registrado. Por favor elige otro.');
        return;
      }

      // 🛡️ SUPER ADVANCED SECURITY ENFORCEMENT:
      // Standard user passwords CANNOT be reused!
      // ONLY the master admin key can be shared among authorized admins.
      const uniqueness = checkPasswordUniqueness(cleanPassword, registeredUsers);
      if (!uniqueness.isUnique) {
        setError(uniqueness.message);
        return;
      }

      // Create new user (automatically admin if master key is used)
      const newUser = createNewUser(cleanUsername, email, cleanPassword);
      onRegisterUser(newUser);
      resetRateLimitState();
      onSuccess(newUser);
    } else {
      // Login mode
      if (!cleanUsername && !email.trim()) {
        setError('Por favor ingresa tu usuario o correo');
        return;
      }
      if (!cleanPassword) {
        setError('Por favor ingresa tu contraseña');
        return;
      }

      const identifier = cleanUsername || email.trim();
      const result = authenticateUser(identifier, cleanPassword, registeredUsers);

      if (!result.success) {
        const rateCheck = recordFailedLoginAttempt();
        if (rateCheck.isLocked) {
          setLockoutRemaining(rateCheck.remainingSecs);
          setError(
            '⚠️ Alerta de Seguridad: Demasiados intentos fallidos. Sistema bloqueado temporalmente por 30 segundos para prevenir ataques de fuerza bruta.'
          );
        } else {
          setError(result.errorMessage || 'Credenciales incorrectas');
        }
        return;
      }

      if (result.user) {
        resetRateLimitState();
        onSuccess(result.user);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto select-none">
      <div className="relative w-full max-w-md bg-[#161616] border border-[#2e2e2e] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 my-auto">
        {/* Top Security Glow accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${
            isSecretAdminPassword
              ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-300'
              : 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500'
          }`}
        />

        {/* Brand header - SinFiltros with Official Logo */}
        <div className="text-center mb-5">
          <div className="relative w-14 h-14 mx-auto mb-2.5 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-purple-500/40 shadow-lg">
            <img
              src="/assets/aistudio/image_b69d934b.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/public/assets/aistudio/image_b69d934b.png';
              }}
              alt="SinFiltros"
              className="w-full h-full object-cover"
              style={{ filter: 'hue-rotate(215deg) saturate(1.8)' }}
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            SinFiltros
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              OFICIAL
            </span>
          </h2>
          <p className="text-xs text-[#aaaaaa] mt-1">
            Plataforma con Sistema de Seguridad Criptográfica Avanzada
          </p>
        </div>

        {/* Mode switch tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 bg-[#101010] rounded-xl border border-[#2a2a2a] text-sm">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-center font-medium rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md font-semibold'
                : 'text-[#aaaaaa] hover:text-white'
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-center font-medium rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md font-semibold'
                : 'text-[#aaaaaa] hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Lockout Warning */}
        {isLocked && (
          <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center gap-2.5 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">Protección Anti-Fuerza Bruta Activada</p>
              <p className="text-[11px] text-rose-300">
                Bloqueo de seguridad: {lockoutRemaining} segundos restantes.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !isLocked && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              {mode === 'register' ? 'Nombre de usuario' : 'Usuario o Correo'}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'register' ? 'Elige tu nombre de usuario' : 'Tu usuario o correo'}
                disabled={isLocked}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e0e] border border-[#2b2b2b] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* Email (Optional in registration) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Correo Electrónico <span className="text-neutral-500 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e0e] border border-[#2b2b2b] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Password with Advanced Security Controls */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultar</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={isLocked}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e0e] border border-[#2b2b2b] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono disabled:opacity-50"
                required
              />
            </div>
          </div>

          {/* ADVANCED SECURITY SYSTEM INDICATOR (Live Entropy & Uniqueness Inspection) */}
          {password.length > 0 && mode === 'register' && (
            <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#262626] space-y-2.5">
              {/* Strength Meter Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#888888] flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    Entropía y Fortaleza:
                  </span>
                  <span className="font-semibold text-white">{securityAnalysis.label}</span>
                </div>
                <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${securityAnalysis.color} transition-all duration-300`}
                    style={{ width: `${Math.max(10, securityAnalysis.score)}%` }}
                  />
                </div>
              </div>

              {/* Password Uniqueness Verification Status */}
              {uniquenessResult && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 transition-all ${
                    uniquenessResult.isAdminKey
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : uniquenessResult.isUnique
                      ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {uniquenessResult.isAdminKey ? (
                    <>
                      <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-300">
                          Llave Maestra de Administrador Detectada
                        </p>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                          Esta contraseña autoriza automáticamente el rango de <strong>ADMINISTRADOR EXCLUSIVO</strong>. Solo quienes la conocen tienen permisos para subir videos y moderar.
                        </p>
                      </div>
                    </>
                  ) : uniquenessResult.isUnique ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">Contraseña Única Verificada</p>
                        <p className="text-[11px] text-neutral-300 leading-relaxed mt-0.5">
                          {uniquenessResult.message}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-300">Colisión de Contraseña Detectada</p>
                        <p className="text-[11px] text-rose-200 leading-relaxed mt-0.5">
                          {uniquenessResult.message}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Login Mode Info for Master Key */}
          {password.length > 0 && mode === 'login' && isSecretAdminPassword && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-2.5">
              <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-300">Acceso como Administrador Autorizado</p>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  Iniciarás sesión con permisos completos de gestión y subida de videos.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLocked || (mode === 'register' && uniquenessResult?.isUnique === false)}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              isSecretAdminPassword
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-amber-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            {isSecretAdminPassword ? (
              <>
                <Crown className="w-4 h-4" />
                <span>
                  {mode === 'register'
                    ? 'Crear Cuenta de Administrador'
                    : 'Entrar como Administrador'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'register' ? 'Crear Cuenta Segura' : 'Entrar a SinFiltros'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security System Badges (No shortcuts, purely cryptographic assurances) */}
        <div className="mt-5 pt-4 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#777777]">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
            <span>Blindaje Anti-Colisiones</span>
          </span>
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Hash Criptográfico 64-bit</span>
          </span>
        </div>
      </div>
    </div>
  );
};
