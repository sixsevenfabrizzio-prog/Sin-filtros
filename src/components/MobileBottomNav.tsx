import React from 'react';
import { Home, Clapperboard, PlusCircle, History, User as UserIcon } from 'lucide-react';
import { User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenUpload,
  onOpenProfile,
  onOpenAuth,
}) => {
  const isAdmin = canUploadVideo(currentUser);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-lg border-t border-[#272727] px-2 py-1 flex items-center justify-around select-none">
      {/* Principal */}
      <button
        type="button"
        onClick={() => onSelectTab('Principal')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors ${
          activeTab === 'Principal' ? 'text-purple-400 font-semibold' : 'text-[#aaaaaa] hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Principal</span>
      </button>

      {/* Shorts */}
      <button
        type="button"
        onClick={() => onSelectTab('Shorts')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors ${
          activeTab === 'Shorts' ? 'text-purple-400 font-semibold' : 'text-[#aaaaaa] hover:text-white'
        }`}
      >
        <Clapperboard className="w-5 h-5" />
        <span className="text-[10px]">Shorts</span>
      </button>

      {/* Center Upload Button (+ for Admin) */}
      {isAdmin ? (
        <button
          type="button"
          onClick={onOpenUpload}
          className="flex-1 py-1 flex flex-col items-center justify-center text-white"
          title="Subir video o short"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-purple-500 shadow-lg shadow-purple-600/40 flex items-center justify-center text-white active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
        </button>
      ) : null}

      {/* Historial */}
      <button
        type="button"
        onClick={() => onSelectTab('Historial')}
        className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition-colors ${
          activeTab === 'Historial' ? 'text-purple-400 font-semibold' : 'text-[#aaaaaa] hover:text-white'
        }`}
      >
        <History className="w-5 h-5" />
        <span className="text-[10px]">Historial</span>
      </button>

      {/* Profile / Tú */}
      <button
        type="button"
        onClick={currentUser ? onOpenProfile : onOpenAuth}
        className="flex-1 py-1.5 flex flex-col items-center justify-center gap-1 text-[#aaaaaa] hover:text-white transition-colors"
      >
        {currentUser ? (
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-purple-500"
            />
            {isAdmin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-600 rounded-full text-[7px] text-white flex items-center justify-center">
                ★
              </span>
            )}
          </div>
        ) : (
          <UserIcon className="w-5 h-5 text-purple-400" />
        )}
        <span className="text-[10px] truncate max-w-[50px]">
          {currentUser ? 'Tú' : 'Acceder'}
        </span>
      </button>
    </nav>
  );
};
