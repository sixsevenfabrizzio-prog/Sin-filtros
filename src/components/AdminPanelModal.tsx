import React from 'react';
import {
  Crown,
  X,
  Trash2,
  Eye,
  Heart,
  Video as VideoIcon,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Video, User } from '../types.ts';
import { ADMIN_SECRET_KEY } from '../utils/auth.ts';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  videos: Video[];
  onDeleteVideo: (videoId: string) => void;
  onOpenUpload: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  videos,
  onDeleteVideo,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);
  const totalStorage = videos.reduce((acc, v) => acc + (v.fileSizeMb || 20), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          aria-label="Cerrar panel de administración"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              SinFiltros Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Panel de Administración
              </span>
            </h3>
            <p className="text-xs text-[#aaaaaa]">
              Gestión centralizada para mantener el orden, la calidad y moderar los videos de SinFiltros.
            </p>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-purple-200">
              Autenticación Maestra Activa
            </p>
            <p className="text-purple-200/80 mt-0.5 leading-relaxed">
              Has iniciado sesión con la clave secreta de administración exclusiva (<code>{ADMIN_SECRET_KEY}</code>). Tienes permisos exclusivos para subir videos, eliminar títulos y moderar el canal.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 bg-[#181818] border border-[#272727] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#aaaaaa] mb-1">
              <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Total Videos</span>
            </div>
            <p className="text-xl font-bold text-white">{videos.length}</p>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#272727] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#aaaaaa] mb-1">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Visualizaciones</span>
            </div>
            <p className="text-xl font-bold text-white">
              {totalViews.toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#272727] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#aaaaaa] mb-1">
              <Heart className="w-3.5 h-3.5 text-purple-400" />
              <span>Me Gusta</span>
            </div>
            <p className="text-xl font-bold text-white">
              {totalLikes.toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 bg-[#181818] border border-[#272727] rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-[#aaaaaa] mb-1">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>Espacio Total</span>
            </div>
            <p className="text-xl font-bold text-white">
              {totalStorage.toFixed(0)} MB
            </p>
          </div>
        </div>

        {/* Video Table / Management */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Contenido del Canal</h4>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="text-xs px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
            >
              + Subir Nuevo Video
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-16 h-10 object-cover rounded-lg bg-neutral-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{vid.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {vid.category}
                      </span>
                      <span>{vid.durationFormatted}</span>
                      <span>•</span>
                      <span>{vid.quality}</span>
                      <span>•</span>
                      <span>{vid.views} vistas</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar video "${vid.title}" para mantener el orden?`)) {
                      onDeleteVideo(vid.id);
                    }
                  }}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors shrink-0"
                  title="Eliminar este video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
