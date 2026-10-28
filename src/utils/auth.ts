import { User, UserRole } from '../types.ts';
import { hashPassword } from './security.ts';

export const ADMIN_SECRET_KEY = 'Angelina1726otaku_j77';

export const STORAGE_KEYS = {
  CURRENT_USER: 'sinfiltros_current_user',
  USERS_LIST: 'sinfiltros_registered_users',
  VIDEOS_LIST: 'sinfiltros_videos_list',
  LIKED_VIDEOS: 'sinfiltros_liked_videos',
  SAVED_VIDEOS: 'sinfiltros_saved_videos',
  COMMENTS_MAP: 'sinfiltros_comments_map',
  CATEGORIES_LIST: 'sinfiltros_custom_categories',
  NOTIFICATIONS_LIST: 'sinfiltros_admin_notifications',
  HISTORY_VIDEOS: 'sinfiltros_history_videos',
};

/**
 * Automatically detects if a video should be classified as a Short.
 * Any video of 30 seconds or less is automatically detected as a Short!
 */
export function isShortVideo(durationSeconds: number): boolean {
  return typeof durationSeconds === 'number' && durationSeconds > 0 && durationSeconds <= 30;
}

/**
 * Determines whether a password grants exclusive Administrator privileges.
 * ONLY the exact master password 'Angelina1726otaku_j77' unlocks admin role.
 */
export function determineRoleFromPassword(password: string): UserRole {
  return password.trim() === ADMIN_SECRET_KEY ? 'admin' : 'viewer';
}

/**
 * Verifies if a user has permission to upload and manage videos.
 */
export function canUploadVideo(user: User | null | undefined): boolean {
  return user?.role === 'admin';
}

/**
 * Creates a new user record with role and encrypted password hash.
 */
export function createNewUser(
  username: string,
  email: string,
  password: string,
  avatarUrl?: string
): User {
  const cleanUsername = username.trim() || 'Usuario';
  const cleanEmail = email.trim().toLowerCase() || `${cleanUsername.toLowerCase().replace(/\s+/g, '')}@sinfiltros.tv`;
  const role = determineRoleFromPassword(password);
  const passwordHash = hashPassword(password.trim());

  return {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    email: cleanEmail,
    role,
    passwordHash,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
    createdAt: new Date().toISOString(),
  };
}

export interface AuthResult {
  success: boolean;
  user?: User;
  errorMessage?: string;
}

/**
 * Authenticates user credentials with cryptographic validation.
 */
export function authenticateUser(
  identifier: string,
  password: string,
  registeredUsers: User[] = []
): AuthResult {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  const existing = registeredUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanIdentifier ||
      u.username.toLowerCase() === cleanIdentifier
  );

  const passwordRole = determineRoleFromPassword(cleanPassword);

  if (existing) {
    // 1. If user entered the exact master admin key, grant admin session
    if (passwordRole === 'admin') {
      const updatedUser: User = {
        ...existing,
        role: 'admin',
        passwordHash: hashPassword(cleanPassword),
      };
      return { success: true, user: updatedUser };
    }

    // 2. Normal user login: check password hash match
    const inputHash = hashPassword(cleanPassword);
    if (existing.passwordHash && existing.passwordHash !== inputHash) {
      return {
        success: false,
        errorMessage: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
      };
    }

    return { success: true, user: existing };
  }

  // If not found in registered users, check if they are logging in with the master admin key
  if (passwordRole === 'admin') {
    const newAdmin = createNewUser(identifier, '', cleanPassword);
    return { success: true, user: newAdmin };
  }

  return {
    success: false,
    errorMessage: 'No se encontró ninguna cuenta con ese usuario. Por favor selecciona "Registrarse" para crear una nueva.',
  };
}
