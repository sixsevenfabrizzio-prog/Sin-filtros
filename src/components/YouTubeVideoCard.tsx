import React, { useState } from 'react';
import { Download, CheckCircle2, Trash2, Check } from 'lucide-react';
import { Video, User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface YouTubeVideoCardProps {
  video: Video;
  currentUser: User | null;
  onSelect: (video: Video) => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  video,
  currentUser,
  onSelect,
  onDeleteVideo,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const isAdmin = canUploadVideo(currentUser);

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);

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

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      const a = document.createElement('a');
      a.href = video.videoUrl;
      a.target = '_blank';
      a.download = `SinFiltros_Video_${video.id}.mp4`;
      a.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar "${video.title}" para mantener el orden del catálogo?`)) {
      onDeleteVideo?.(video.id);
    }
  };

  const formattedViews =
    video.views >= 1000000
      ? `${(video.views / 1000000).toFixed(1)} M de`
      : video.views >= 1000
      ? `${(video.views / 1000).toFixed(0)} K`
      : video.views;

  return (
    <div
      onClick={() => onSelect(video)}
      className="group flex flex-col cursor-pointer select-none transition-transform duration-200"
    >
      {/* 16:9 Thumbnail with YouTube styling */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#181818]">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Quality Badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-purple-300 border border-purple-500/30">
          {video.quality}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-medium font-mono text-white">
          {video.durationFormatted}
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={handleDownloadClick}
            aria-label={`Descargar ${video.title}`}
            title="Descargar video"
            className="p-1.5 rounded-lg bg-black/80 hover:bg-purple-600 text-white transition-colors"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : downloaded ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {isAdmin && onDeleteVideo && (
            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label="Eliminar video"
              title="Eliminar del canal (Admin)"
              className="p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Video Info under Thumbnail */}
      <div className="flex gap-3 mt-3 px-0.5">
        {/* Channel Avatar */}
        <div className="w-9 h-9 rounded-full bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0 overflow-hidden">
          {video.author.substring(0, 2).toUpperCase()}
        </div>

        {/* Text Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-purple-200 transition-colors">
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-[#aaaaaa]">
            <span className="truncate hover:text-white transition-colors">{video.author}</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#383838] flex items-center justify-center text-[8px] text-white">
              ✓
            </span>
          </div>

          <div className="text-xs text-[#aaaaaa] flex items-center gap-1 mt-0.5">
            <span>{formattedViews} vistas</span>
            <span>•</span>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
