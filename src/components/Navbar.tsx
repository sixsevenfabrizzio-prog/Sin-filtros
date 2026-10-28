import React, { useState } from 'react';
import {
  Search,
  Upload,
  Crown,
  User as UserIcon,
  LogOut,
  Sliders,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onOpenAdminPanel: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUpload,
  onOpenAdminPanel,
  searchQuery,
  onSearchChange,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isAdmin = canUploadVideo(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">NovaStream</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                HD
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 hidden sm:inline -mt-1">
              Streaming & Descarga Libre
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar videos, trailers, animación, documentales..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upload Button */}
          {currentUser && (
            <button
              type="button"
              onClick={onOpenUpload}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-amber-500/20'
                  : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-neutral-700/60'
              }`}
              title={isAdmin ? 'Subir video como Administrador' : 'Solo Administradores pueden subir videos'}
            >
              {isAdmin ? (
                <>
                  <Crown className="w-4 h-4 text-black shrink-0" />
                  <span className="hidden sm:inline">Subir Video</span>
                  <span className="sm:hidden font-mono text-xs">+Subir</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="hidden sm:inline">Subir</span>
                </>
              )}
            </button>
          )}

          {/* User profile dropdown or Login button */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
                aria-label="Menú de usuario"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-lg bg-neutral-800 object-cover border border-neutral-700"
                  />
                  {isAdmin && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-black rounded-full flex items-center justify-center text-[9px] font-bold shadow">
                      ★
                    </span>
                  )}
                </div>

                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                    {currentUser.username}
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-none mt-0.5 ${
                      isAdmin ? 'text-amber-400' : 'text-neutral-400'
                    }`}
                  >
                    {isAdmin ? '👑 Administrador' : '👁️ Espectador'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="p-3 border-b border-neutral-800">
                    <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{currentUser.email}</p>

                    <div className="mt-2.5">
                      {isAdmin ? (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 font-medium">
                          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Administrador Exclusivo</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5">
                          <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span>Cuenta de Espectador</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span>Panel de Control Admin</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-600/30"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
