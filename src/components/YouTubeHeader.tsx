import React, { useState } from 'react';
import {
  Menu,
  Search,
  Mic,
  Video as VideoCamera,
  Bell,
  Crown,
  LogOut,
  Sliders,
  User as UserIcon,
  CheckCircle,
  Camera,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { User, AdminNotification } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';
import { DeviceDetectorBadge } from './DeviceDetectorBadge.tsx';

interface YouTubeHeaderProps {
  currentUser: User | null;
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onOpenAdminStudio: () => void;
  onOpenEditProfile: () => void;
  onOpenCategories: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  deviceInfo?: any;
  currentDevice?: any;
  forcedDevice?: any;
  onSetForcedDevice?: (dev: any) => void;
  isMobile?: boolean;
}

const DEFAULT_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n1',
    title: 'Detección de Shorts Activada',
    message: 'Cualquier video que subas con duración de 30 segundos o menos se convertirá automáticamente en un Short vertical.',
    time: 'Ahora',
    type: 'system',
    read: false,
  },
  {
    id: 'n2',
    title: 'Catálogo Limpio y Exclusivo',
    message: 'Los usuarios normales tienen bloqueada la subida de videos. Solo tú con la clave maestra puedes publicar.',
    time: 'Hace 5 min',
    type: 'upload',
    read: false,
  },
  {
    id: 'n3',
    title: 'Gestor de Categorías Disponible',
    message: 'Puedes agregar o editar tus propias categorías desde el menú de usuario.',
    time: 'Hace 1 hora',
    type: 'system',
    read: false,
  },
];

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({
  currentUser,
  onToggleSidebar,
  onOpenAuth,
  onLogout,
  onOpenUpload,
  onOpenAdminStudio,
  onOpenEditProfile,
  onOpenCategories,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  deviceInfo,
  currentDevice,
  forcedDevice,
  onSetForcedDevice,
  isMobile,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(DEFAULT_ADMIN_NOTIFICATIONS);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isAdmin = canUploadVideo(currentUser);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit?.();
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-[#272727] px-2.5 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left: Hamburger (hidden on mobile) & SinFiltros Logo Image with purple hue */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Guía de navegación"
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* SinFiltros Logo using uploaded image with purple color tint */}
        <div
          onClick={() => {
            onSearchChange('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer group"
          title="Página principal de SinFiltros"
        >
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-purple-500/40 shadow-sm transition-transform group-hover:scale-105">
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

          <div className="flex items-center">
            <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight font-sans">
              SinFiltros
            </span>
            <span className="text-[9px] font-bold text-purple-300 align-super ml-1.5 border border-purple-500/40 rounded px-1.5 py-0.2 bg-purple-500/15">
              OFICIAL
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar & Mic Button (Adaptive for Mobile / Tablet / Laptop / PC) */}
      {mobileSearchOpen ? (
        <div className="flex-1 flex items-center bg-[#121212] border border-purple-500 rounded-full px-3 py-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar en SinFiltros..."
            autoFocus
            className="w-full bg-transparent text-xs text-white placeholder-[#888888] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="text-xs text-[#888888] hover:text-white ml-2 p-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex-1 max-w-2xl mx-1 sm:mx-2 flex items-center justify-center">
          <div className="hidden sm:flex items-center w-full max-w-xl">
            <div className="flex items-center flex-1 bg-[#121212] border border-[#303030] rounded-l-full focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 pl-4 py-0 transition-all">
              <Search className="w-4 h-4 text-[#888888] mr-2 shrink-0 hidden md:block" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar videos o shorts..."
                className="w-full bg-transparent py-2 text-sm text-white placeholder-[#888888] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#888888] hover:text-white px-2 py-1 mr-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSearchSubmit?.()}
              aria-label="Buscar"
              title="Buscar"
              className="px-4 sm:px-5 py-2.5 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#272727] text-white transition-colors"
            >
              <Search className="w-4 h-4 text-neutral-300" />
            </button>
          </div>

          {/* Microphone Button (desktop/laptop) */}
          <button
            type="button"
            aria-label="Buscar con la voz"
            title="Buscar con la voz"
            className="ml-3 p-2.5 rounded-full bg-[#222222] hover:bg-[#272727] text-white hidden md:flex items-center justify-center transition-colors shrink-0"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right: Device Detection Badge, Mobile Search Icon, Upload, Notifications, Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Search Button (only on small screens when search is collapsed) */}
        {!mobileSearchOpen && (
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Buscar"
            className="p-2 rounded-full hover:bg-[#272727] text-white sm:hidden transition-colors"
          >
            <Search className="w-4 h-4 text-neutral-300" />
          </button>
        )}

        {/* Live Device Detection & Adaptive View Badge */}
        {deviceInfo && (
          <DeviceDetectorBadge
            deviceInfo={deviceInfo}
            currentDevice={currentDevice}
            forcedDevice={forcedDevice}
            onSetForcedDevice={onSetForcedDevice || (() => {})}
          />
        )}

        {/* Create Video Button (+) - Hidden on mobile because it's in the mobile bottom bar */}
        {!isMobile && (
          <button
            type="button"
            onClick={onOpenUpload}
            title={isAdmin ? 'Subir video o short (Admin Exclusivo)' : 'Subir contenido'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isAdmin
                ? 'bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50'
                : 'bg-[#222222] hover:bg-[#272727] text-white'
            }`}
          >
            <VideoCamera className={`w-4 h-4 ${isAdmin ? 'text-purple-400' : 'text-white'}`} />
            <span className="hidden md:inline font-semibold">
              {isAdmin ? 'Subir video' : 'Crear'}
            </span>
          </button>
        )}

        {/* Notifications Bell - ONLY APPEARS AND WORKS FOR ADMINISTRATORS as requested */}
        {isAdmin && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              aria-label="Notificaciones del Administrador"
              title="Notificaciones de Administración"
              className="p-2 rounded-full hover:bg-[#272727] text-white relative transition-colors"
            >
              <Bell className="w-5 h-5 text-purple-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Admin Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1f1f1f] border border-[#383838] rounded-2xl shadow-2xl p-3 z-50 text-white">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#333333]">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-purple-400" />
                    Notificaciones de Admin
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[11px] text-[#aaaaaa] hover:text-white"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs transition-colors ${
                        n.read
                          ? 'bg-[#181818] border-[#292929] text-[#aaaaaa]'
                          : 'bg-purple-950/30 border-purple-500/30 text-neutral-200'
                      }`}
                    >
                      <p className="font-semibold text-white mb-0.5">{n.title}</p>
                      <p className="text-[11px] text-[#cccccc] leading-snug">{n.message}</p>
                      <span className="text-[10px] text-[#888888] block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile / Account Menu */}
        {currentUser ? (
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center focus:outline-none"
              aria-label="Menú de perfil"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full bg-[#272727] object-cover ring-2 ring-purple-500/40"
                />
                {isAdmin && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow">
                    ★
                  </span>
                )}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#282828] border border-[#383838] rounded-2xl shadow-2xl py-2 z-50 text-white">
                <div className="px-4 py-3 border-b border-[#383838] flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="w-10 h-10 rounded-full bg-[#181818] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                      <span>{currentUser.username}</span>
                      {isAdmin && <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                    </p>
                    <p className="text-xs text-[#aaaaaa] truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      {isAdmin ? (
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          👑 Administrador Exclusivo
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#383838] text-[#cccccc]">
                          Espectador
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  {/* Edit Profile (Available for both admin and viewers to change photo from gallery) */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenEditProfile();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#383838] flex items-center gap-3 transition-colors text-neutral-200"
                  >
                    <Camera className="w-4 h-4 text-purple-400" />
                    <span>Editar perfil (Foto y nombre)</span>
                  </button>

                  {/* Admin Only Features */}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenCategories();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#383838] flex items-center gap-3 transition-colors text-purple-300 font-medium"
                      >
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Gestor de Categorías (Admin)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAdminStudio();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#383838] flex items-center gap-3 transition-colors text-purple-300 font-medium"
                      >
                        <Sliders className="w-4 h-4 text-purple-400" />
                        <span>Panel de Administración</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#383838] flex items-center gap-3 transition-colors text-rose-400 border-t border-[#383838] mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-500 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span>Acceder</span>
          </button>
        )}
      </div>
    </header>
  );
};
