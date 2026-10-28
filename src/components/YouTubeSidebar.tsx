import React from 'react';
import {
  Home,
  Clapperboard,
  History,
  Crown,
  Layers,
  Sparkles,
  Settings,
} from 'lucide-react';
import { User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface YouTubeSidebarProps {
  isOpen: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAdminStudio: () => void;
  onOpenUpload: () => void;
  onOpenCategories: () => void;
}

export const YouTubeSidebar: React.FC<YouTubeSidebarProps> = ({
  isOpen,
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAdminStudio,
  onOpenUpload,
  onOpenCategories,
}) => {
  const isAdmin = canUploadVideo(currentUser);

  if (!isOpen) {
    // Collapsed Mini Rail Sidebar (Simplified)
    return (
      <aside className="w-18 bg-[#0f0f0f] flex flex-col items-center py-2 shrink-0 select-none border-r border-[#272727] hidden sm:flex">
        <button
          type="button"
          onClick={() => onSelectTab('Principal')}
          className={`w-16 py-3 flex flex-col items-center justify-center rounded-xl text-[10px] gap-1.5 transition-colors ${
            activeTab === 'Principal'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#aaaaaa] hover:bg-[#272727]/60 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'Principal' ? 'text-purple-400' : ''}`} />
          <span>Principal</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('Shorts')}
          className={`w-16 py-3 flex flex-col items-center justify-center rounded-xl text-[10px] gap-1.5 transition-colors ${
            activeTab === 'Shorts'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#aaaaaa] hover:bg-[#272727]/60 hover:text-white'
          }`}
        >
          <Clapperboard className={`w-5 h-5 ${activeTab === 'Shorts' ? 'text-purple-400' : ''}`} />
          <span>Shorts</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('Historial')}
          className={`w-16 py-3 flex flex-col items-center justify-center rounded-xl text-[10px] gap-1.5 transition-colors ${
            activeTab === 'Historial'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#aaaaaa] hover:bg-[#272727]/60 hover:text-white'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'Historial' ? 'text-purple-400' : ''}`} />
          <span>Historial</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdminStudio}
            className="w-16 py-3 mt-2 flex flex-col items-center justify-center rounded-xl text-[10px] gap-1 text-purple-400 hover:bg-purple-950/40 hover:text-purple-300 transition-colors"
            title="Panel de Administración"
          >
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-[9px]">Admin</span>
          </button>
        )}
      </aside>
    );
  }

  // Expanded Simplified Sidebar as requested
  return (
    <aside className="w-56 bg-[#0f0f0f] border-r border-[#272727] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto px-3 py-3 select-none text-white scrollbar-thin shrink-0 z-30">
      {/* Primary Simplified Section */}
      <div className="space-y-1 pb-3 border-b border-[#272727]">
        <button
          type="button"
          onClick={() => onSelectTab('Principal')}
          className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'Principal'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#f1f1f1] hover:bg-[#272727]'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'Principal' ? 'text-purple-400' : ''}`} />
          <span>Principal</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('Shorts')}
          className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'Shorts'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#f1f1f1] hover:bg-[#272727]'
          }`}
        >
          <Clapperboard className={`w-5 h-5 ${activeTab === 'Shorts' ? 'text-purple-400' : ''}`} />
          <div className="flex items-center gap-2">
            <span>Shorts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              ≤ 30s
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('Historial')}
          className={`w-full flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'Historial'
              ? 'bg-[#272727] text-white font-semibold'
              : 'text-[#f1f1f1] hover:bg-[#272727]'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'Historial' ? 'text-purple-400' : ''}`} />
          <span>Historial</span>
        </button>
      </div>

      {/* Admin Management Section (Exclusive for Admin) */}
      {isAdmin && (
        <div className="py-3 border-b border-[#272727] space-y-1.5">
          <div className="px-3 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              Gestión Admin
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCategories}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 transition-colors"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Editar Categorías</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdminStudio}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-purple-200 hover:bg-[#272727] transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Panel de Control</span>
          </button>

          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Subir Video o Short</span>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-auto pt-4 px-3 text-[11px] text-[#717171] leading-relaxed">
        <p className="font-semibold text-purple-400/80 mb-1">SinFiltros</p>
        <p className="text-[10px] text-[#555555]">© 2026 SinFiltros. Todos los derechos reservados.</p>
      </div>
    </aside>
  );
};
