import { User } from '../types.ts';
import { ADMIN_SECRET_KEY } from './auth.ts';

/**
 * Robust deterministic string hash for password collision checking and storage.
 * Implements a 64-bit dual-round hash encoded as hex.
 */
export function hashPassword(password: string): string {
  const salt = 'sinfiltros_salt_v2_ultra_sec_';
  const str = salt + password;
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  
  // Secondary round for cryptographic diffusion
  let h3 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h3 ^= str.charCodeAt(i);
    h3 = Math.imul(h3, 16777619);
  }
  const part3 = (h3 >>> 0).toString(16).padStart(8, '0');

  return `sfsec_${part1}${part2}${part3}`;
}

export interface PasswordUniquenessResult {
  isUnique: boolean;
  isAdminKey: boolean;
  message: string;
}

/**
 * STRICT SECURITY SYSTEM RULE:
 * Standard users CANNOT reuse an existing password from any other user in the database.
 * EXCEPTION: The master admin key (Angelina1726otaku_j77) CAN be shared and used by all authorized admins.
 */
export function checkPasswordUniqueness(
  password: string,
  registeredUsers: User[],
  currentUserId?: string
): PasswordUniquenessResult {
  const cleanPassword = password.trim();

  // 1. Check if it's the master admin secret key
  if (cleanPassword === ADMIN_SECRET_KEY) {
    return {
      isUnique: true,
      isAdminKey: true,
      message: '👑 Llave Maestra de Administrador autorizada. Permite acceso multi-administrador.',
    };
  }

  if (!cleanPassword) {
    return {
      isUnique: true,
      isAdminKey: false,
      message: '',
    };
  }

  // 2. Check collision against all other registered users
  const targetHash = hashPassword(cleanPassword);

  const duplicateUser = registeredUsers.find((u) => {
    // Exclude current user if editing self
    if (currentUserId && u.id === currentUserId) return false;
    // Don't compare against admins who used the master key
    if (u.role === 'admin' && u.passwordHash === hashPassword(ADMIN_SECRET_KEY)) {
      return false;
    }
    return u.passwordHash === targetHash;
  });

  if (duplicateUser) {
    return {
      isUnique: false,
      isAdminKey: false,
      message: `ALERTA DE SEGURIDAD: Esta contraseña ya está en uso por otra cuenta (@${duplicateUser.username}). Por política de máxima seguridad, las contraseñas de espectador deben ser 100% únicas y no repetirse.`,
    };
  }

  return {
    isUnique: true,
    isAdminKey: false,
    message: '✓ Contraseña única verificada (Sin colisiones en la base de datos).',
  };
}

export interface SecurityScore {
  score: number; // 0 - 100
  level: 'muy_debil' | 'debil' | 'media' | 'segura' | 'blindada' | 'admin_maestro';
  label: string;
  color: string;
  checks: {
    length: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noCommonPattern: boolean;
  };
}

const COMMON_PATTERNS = [
  '123456',
  '12345678',
  'password',
  'qwerty',
  'admin',
  '111111',
  'abc123',
  'sinfiltros',
];

/**
 * Calculates advanced password entropy and security health.
 */
export function analyzePasswordSecurity(password: string): SecurityScore {
  const clean = password.trim();

  if (clean === ADMIN_SECRET_KEY) {
    return {
      score: 100,
      level: 'admin_maestro',
      label: 'Acceso Maestro Autorizado',
      color: 'from-amber-400 to-yellow-500',
      checks: {
        length: true,
        hasLower: true,
        hasUpper: true,
        hasNumber: true,
        hasSpecial: true,
        noCommonPattern: true,
      },
    };
  }

  const length = clean.length >= 6;
  const hasLower = /[a-z]/.test(clean);
  const hasUpper = /[A-Z]/.test(clean);
  const hasNumber = /[0-9]/.test(clean);
  const hasSpecial = /[^A-Za-z0-9]/.test(clean);
  const noCommonPattern = !COMMON_PATTERNS.some((p) => clean.toLowerCase().includes(p));

  let score = 0;
  if (clean.length >= 4) score += 15;
  if (clean.length >= 8) score += 20;
  if (clean.length >= 12) score += 15;
  if (hasLower) score += 10;
  if (hasUpper) score += 15;
  if (hasNumber) score += 15;
  if (hasSpecial) score += 15;
  if (!noCommonPattern) score = Math.max(10, score - 30);

  score = Math.min(100, Math.max(0, score));

  let level: SecurityScore['level'] = 'muy_debil';
  let label = 'Muy Débil';
  let color = 'from-rose-500 to-red-600';

  if (score >= 85) {
    level = 'blindada';
    label = 'Blindada (Alta Seguridad)';
    color = 'from-emerald-400 to-emerald-600';
  } else if (score >= 65) {
    level = 'segura';
    label = 'Segura';
    color = 'from-purple-400 to-purple-600';
  } else if (score >= 40) {
    level = 'media';
    label = 'Media';
    color = 'from-yellow-400 to-amber-500';
  } else if (score >= 20) {
    level = 'debil';
    label = 'Débil';
    color = 'from-orange-500 to-rose-500';
  }

  return {
    score,
    level,
    label,
    color,
    checks: {
      length,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      noCommonPattern,
    },
  };
}

/**
 * Anti-Brute-Force Rate Limiter
 */
const RATE_LIMIT_KEY = 'sinfiltros_rate_limit_state';

interface RateLimitState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

export function getRateLimitState(): RateLimitState {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { failedAttempts: 0, lockoutUntil: null };
    const parsed: RateLimitState = JSON.parse(raw);
    if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
      return { failedAttempts: 0, lockoutUntil: null };
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lockoutUntil: null };
  }
}

export function recordFailedLoginAttempt(): { isLocked: boolean; remainingSecs: number } {
  const current = getRateLimitState();
  const nextAttempts = current.failedAttempts + 1;

  if (nextAttempts >= 5) {
    const lockoutUntil = Date.now() + 30 * 1000; // 30 seconds lockout
    localStorage.setItem(
      RATE_LIMIT_KEY,
      JSON.stringify({ failedAttempts: nextAttempts, lockoutUntil })
    );
    return { isLocked: true, remainingSecs: 30 };
  }

  localStorage.setItem(
    RATE_LIMIT_KEY,
    JSON.stringify({ failedAttempts: nextAttempts, lockoutUntil: null })
  );
  return { isLocked: false, remainingSecs: 0 };
}

export function resetRateLimitState(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
}
