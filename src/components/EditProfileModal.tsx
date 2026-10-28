import React, { useState } from 'react';
import { X, Camera, User as UserIcon, Check, Crown } from 'lucide-react';
import { User } from '../types.ts';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateProfile: (updated: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      username: username.trim(),
      avatarUrl: avatarPreview || currentUser.avatarUrl,
    };

    onUpdateProfile(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#1f1f1f] border border-[#333333] rounded-2xl shadow-2xl p-6 text-white select-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Editar Perfil</h3>
        <p className="text-xs text-[#aaaaaa] mb-6">
          Actualiza tu nombre y tu foto de perfil desde tu galería.
        </p>

        {savedSuccess ? (
          <div className="py-8 text-center text-purple-400 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">¡Perfil actualizado con éxito!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview & Upload */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt={username}
                  className="w-24 h-24 rounded-full object-cover bg-[#141414] ring-4 ring-purple-600/40 group-hover:ring-purple-500 transition-all shadow-xl"
                />

                <label
                  htmlFor="profile-photo-upload"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[11px] font-medium"
                >
                  <Camera className="w-6 h-6 mb-1 text-purple-300" />
                  <span>Cambiar</span>
                </label>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <label
                htmlFor="profile-photo-upload-btn"
                className="mt-3 text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                Elegir foto desde la galería
              </label>
              <input
                id="profile-photo-upload-btn"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre o apodo"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#383838] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Role indicator */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#2b2b2b] flex items-center justify-between text-xs">
              <span className="text-[#aaaaaa]">Rango actual:</span>
              {currentUser.role === 'admin' ? (
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  Administrador Exclusivo
                </span>
              ) : (
                <span className="text-neutral-300">Espectador</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#272727] hover:bg-[#383838] text-xs font-semibold text-[#cccccc] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/30 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
