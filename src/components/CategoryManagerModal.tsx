import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Crown, Layers, AlertCircle } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onUpdateCategories: (newCats: string[]) => void;
  isAdmin: boolean;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
  isAdmin,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#1f1f1f] border border-[#333333] rounded-2xl p-6 text-center text-white">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Acceso No Autorizado</h3>
          <p className="text-xs text-[#aaaaaa] mb-4">
            Solo el Administrador Exclusivo puede gestionar las categorías de SinFiltros para mantener el orden.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#2a2a2a] text-xs font-semibold hover:bg-[#333333]"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      alert('Esta categoría ya existe');
      return;
    }

    onUpdateCategories([...categories, clean]);
    setNewCatName('');
  };

  const handleDelete = (index: number) => {
    const cat = categories[index];
    if (cat === 'Todos') {
      alert('La categoría "Todos" es obligatoria para el funcionamiento del catálogo.');
      return;
    }
    if (confirm(`¿Eliminar la categoría "${cat}"?`)) {
      onUpdateCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleSaveEdit = (index: number) => {
    const clean = editingValue.trim();
    if (!clean) return;
    const updated = [...categories];
    updated[index] = clean;
    onUpdateCategories(updated);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-[#1f1f1f] border border-[#383838] rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Gestor de Categorías
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Exclusivo Admin
                </span>
              </h3>
              <p className="text-xs text-[#aaaaaa]">
                Agrega, renombra o elimina categorías visibles para todos los usuarios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add new Category Form */}
        <form onSubmit={handleAdd} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nombre de nueva categoría..."
            className="flex-1 px-4 py-2 bg-[#121212] border border-[#383838] rounded-xl text-sm text-white placeholder-[#888888] focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </form>

        {/* Categories list */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
          {categories.map((cat, idx) => {
            const isProtected = cat === 'Todos';
            const isEditing = editingIndex === idx;

            return (
              <div
                key={cat}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#141414] border border-[#2b2b2b]"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 px-3 py-1 bg-black border border-purple-500 rounded-lg text-xs text-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="p-1 rounded bg-purple-600 text-white hover:bg-purple-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#f1f1f1] font-medium">{cat}</span>
                    {isProtected && (
                      <span className="text-[10px] text-neutral-500 italic">(Filtro base)</span>
                    )}
                  </div>
                )}

                {!isProtected && !isEditing && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(idx)}
                      className="p-1.5 rounded-lg hover:bg-[#2b2b2b] text-neutral-400 hover:text-white"
                      title="Editar nombre"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 rounded-lg hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#333333] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
