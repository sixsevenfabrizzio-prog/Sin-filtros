import React, { useState } from 'react';
import { MessageSquare, Send, Crown, Trash2, Heart, ShieldCheck } from 'lucide-react';
import { VideoComment, User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface CommentsSectionProps {
  videoId: string;
  comments: VideoComment[];
  currentUser: User | null;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onPromptLogin: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  videoId,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onPromptLogin,
}) => {
  const [text, setText] = useState('');
  const isAdmin = canUploadVideo(currentUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onPromptLogin();
      return;
    }
    if (!text.trim()) return;

    onAddComment(text.trim());
    setText('');
  };

  return (
    <div className="mt-8 pt-6 border-t border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-500" />
          <span>Comentarios</span>
          <span className="text-sm font-normal text-neutral-400">({comments.length})</span>
        </h3>

        {isAdmin && (
          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Moderación de Administrador Activa</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
          {currentUser ? (
            <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
          ) : (
            '?'
          )}
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              currentUser
                ? `Escribe un comentario como ${currentUser.username}${isAdmin ? ' (👑 Admin)' : ''}...`
                : 'Inicia sesión para dejar un comentario...'
            }
            className="w-full pl-4 pr-12 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          <button
            type="submit"
            aria-label="Publicar comentario"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-neutral-500 italic py-4 text-center">
            Sé el primero en comentar este video...
          </p>
        ) : (
          comments.map((c) => {
            const isAuthorAdmin = c.userRole === 'admin';
            const canDelete = isAdmin || (currentUser && currentUser.id === c.userId);

            return (
              <div key={c.id} className="flex gap-3 text-sm p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/60">
                <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                  {c.username.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-200">{c.username}</span>
                      {isAuthorAdmin && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Admin
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-500">{c.createdAt}</span>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteComment(c.id)}
                        className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                        title={isAdmin ? 'Moderar/Eliminar comentario (Admin)' : 'Eliminar comentario'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm mt-1 leading-relaxed">
                    {c.text}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => onLikeComment(c.id)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{c.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
