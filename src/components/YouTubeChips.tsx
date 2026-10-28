import React from 'react';
import { Plus, Settings2 } from 'lucide-react';

interface YouTubeChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isAdmin?: boolean;
  onOpenCategoryManager?: () => void;
}

export const YouTubeChips: React.FC<YouTubeChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isAdmin,
  onOpenCategoryManager,
}) => {
  return (
    <div className="sticky top-14 z-20 bg-[#0f0f0f] py-2.5 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-[#272727]/60 select-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              isSelected
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'
            }`}
          >
            {cat}
          </button>
        );
      })}

      {/* Admin exclusive button to manage categories right on the chips bar */}
      {isAdmin && onOpenCategoryManager && (
        <button
          type="button"
          onClick={onOpenCategoryManager}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
          title="Editar y agregar categorías (Solo Admin)"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Gestionar Categorías</span>
        </button>
      )}
    </div>
  );
};
