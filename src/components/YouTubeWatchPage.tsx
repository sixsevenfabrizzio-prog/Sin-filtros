import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Check,
  Trash2,
  Crown,
  Bell,
  MessageSquare,
  Send,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { Video, User, VideoComment } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';
import { VideoPlayer } from './VideoPlayer.tsx';

interface YouTubeWatchPageProps {
  video: Video;
  allVideos: Video[];
  currentUser: User | null;
  onBackToHome: () => void;
  onSelectVideo: (v: Video) => void;
  onDeleteVideo?: (videoId: string) => void;
  comments: VideoComment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onPromptLogin: () => void;
  isLiked: boolean;
  onToggleLike: (videoId: string) => void;
}

export const YouTubeWatchPage: React.FC<YouTubeWatchPageProps> = ({
  video,
  allVideos,
  currentUser,
  onBackToHome,
  onSelectVideo,
  onDeleteVideo,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onPromptLogin,
  isLiked,
  onToggleLike,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const isAdmin = canUploadVideo(currentUser);
  const otherVideos = allVideos.filter((v) => v.id !== video.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDirectDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const cleanTitle = video.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `SinFiltros_${cleanTitle}.mp4`;
      const response = await fetch(video.videoUrl, { mode: 'cors' }).catch(() => null);

      if (response && response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        const a = document.createElement('a');
        a.href = video.videoUrl;
        a.target = '_blank';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch {
      const a = document.createElement('a');
      a.href = video.videoUrl;
      a.target = '_blank';
      a.download = `SinFiltros_Video_${video.id}.mp4`;
      a.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onPromptLogin();
      return;
    }
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  return (
    <div className="max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col xl:flex-row gap-6">
      {/* Left Column: Player, Video Info, Description, Comments */}
      <div className="flex-1 min-w-0">
        {/* Back to Home Breadcrumb */}
        <div className="mb-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-[#aaaaaa] hover:text-white transition-colors"
          >
            <span>‹ Volver a la página principal</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden bg-black shadow-2xl">
          <VideoPlayer video={video} autoPlay={true} />
        </div>

        {/* Video Title */}
        <h1 className="text-lg sm:text-xl font-bold text-white mt-3 leading-snug">
          {video.title}
        </h1>

        {/* Channel Info & YouTube Action Pills Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3 pb-3 border-b border-[#272727]">
          {/* Channel Info & Subscribe */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0 overflow-hidden">
              {video.author.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm text-white">{video.author}</span>
                {video.authorRole === 'admin' ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                    <Crown className="w-3 h-3 text-purple-400" />
                    Admin
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#383838] flex items-center justify-center text-[8px] text-white">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-xs text-[#aaaaaa]">14.2 K suscriptores</span>
            </div>

            {/* Subscribe Pill Button */}
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isSubscribed
                  ? 'bg-[#272727] text-white hover:bg-[#383838]'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isSubscribed ? 'Suscrito' : 'Suscribirme'}
            </button>
          </div>

          {/* Action Buttons Row (YouTube Style Pills) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Joined Like / Dislike Pill */}
            <div className="flex items-center bg-[#272727] rounded-full overflow-hidden border border-[#383838]/60">
              <button
                type="button"
                onClick={() => onToggleLike(video.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold hover:bg-[#383838] transition-colors ${
                  isLiked ? 'text-purple-400' : 'text-white'
                }`}
                aria-label="Me gusta"
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current text-purple-400' : ''}`} />
                <span>{video.likes}</span>
              </button>
              <div className="w-[1px] h-5 bg-[#3f3f3f]" />
              <button
                type="button"
                onClick={() => setDisliked(!disliked)}
                className={`px-3 py-2 text-xs font-semibold hover:bg-[#383838] transition-colors ${
                  disliked ? 'text-purple-400' : 'text-white'
                }`}
                aria-label="No me gusta"
              >
                <ThumbsDown className={`w-4 h-4 ${disliked ? 'fill-current text-purple-400' : ''}`} />
              </button>
            </div>

            {/* Share Pill */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#272727] hover:bg-[#383838] text-white text-xs font-semibold border border-[#383838]/60 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-purple-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>

            {/* Download Pill (YouTube Premium style) */}
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloadSuccess ? '¡Descargado!' : `Descargar (${video.fileSizeMb} MB)`}</span>
            </button>

            {/* Admin Delete Action Pill */}
            {isAdmin && onDeleteVideo && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar "${video.title}" para mantener el orden?`)) {
                    onDeleteVideo(video.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#272727] hover:bg-rose-900/60 text-neutral-300 hover:text-white text-xs font-semibold border border-[#383838]/60 transition-colors"
                title="Eliminar video como Administrador"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* YouTube Gray Description Box */}
        <div className="mt-4 p-4 rounded-xl bg-[#272727] hover:bg-[#2d2d2d] transition-colors text-xs text-[#f1f1f1] leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
            <span>{video.views.toLocaleString()} vistas</span>
            <span>•</span>
            <span>{video.uploadedAt}</span>
            <span>•</span>
            <span className="text-purple-400 font-bold uppercase">{video.quality} UHD</span>
          </div>

          <p className="whitespace-pre-line text-[#cccccc] text-xs sm:text-sm">
            {video.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-[#383838]">
            {video.tags.map((tag) => (
              <span key={tag} className="text-purple-400 hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* YouTube Comments Section */}
        <div className="mt-6">
          <div className="flex items-center gap-6 mb-6">
            <h2 className="text-lg font-bold text-white">
              {comments.length} comentarios
            </h2>
            <button type="button" className="text-xs font-semibold text-[#aaaaaa] hover:text-white">
              Ordenar por
            </button>
          </div>

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-900/70 border border-purple-500/40 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0 overflow-hidden">
              {currentUser ? (
                <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
              ) : (
                '?'
              )}
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  currentUser
                    ? `Añade un comentario como ${currentUser.username}${isAdmin ? ' (👑 Admin)' : ''}...`
                    : 'Inicia sesión para añadir un comentario...'
                }
                className="w-full bg-transparent border-b border-[#383838] focus:border-purple-500 pb-1 text-sm text-white placeholder-[#888888] focus:outline-none transition-colors"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCommentText('')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:bg-[#272727] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white disabled:bg-[#272727] disabled:text-[#717171] transition-colors"
                >
                  Comentar
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-5">
            {comments.map((c) => {
              const isAuthorAdmin = c.userRole === 'admin';
              const canDelete = isAdmin || (currentUser && currentUser.id === c.userId);

              return (
                <div key={c.id} className="flex gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.username.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">@{c.username}</span>
                      {isAuthorAdmin && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-purple-400" />
                          Admin
                        </span>
                      )}
                      <span className="text-[11px] text-[#aaaaaa]">{c.createdAt}</span>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(c.id)}
                          className="ml-auto text-neutral-500 hover:text-rose-400 p-1"
                          title="Eliminar comentario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-[#f1f1f1] mt-1 leading-relaxed">
                      {c.text}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-[#aaaaaa]">
                      <button
                        type="button"
                        onClick={() => onLikeComment(c.id)}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{c.likes > 0 ? c.likes : ''}</span>
                      </button>
                      <button type="button" className="hover:text-white">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="hover:text-white font-semibold">
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Up Next / Recommended List */}
      <div className="w-full xl:w-96 shrink-0 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">Siguientes videos</h3>

        {otherVideos.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#272727] text-xs text-[#aaaaaa] text-center">
            No hay más videos subidos por el Administrador todavía.
          </div>
        ) : (
          otherVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectVideo(item)}
              className="flex gap-2.5 cursor-pointer group"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-[#181818] shrink-0">
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[10px] font-mono font-medium text-white">
                  {item.durationFormatted}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#aaaaaa] mt-1 truncate">{item.author}</p>
                <p className="text-[11px] text-[#aaaaaa]">
                  {item.views.toLocaleString()} vistas • {item.uploadedAt}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
