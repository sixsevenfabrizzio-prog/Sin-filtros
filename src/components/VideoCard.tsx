import React, { useState } from 'react';
import { Play, Download, Crown, Trash2, Eye, Clock, CheckCircle2 } from 'lucide-react';
import { Video, User } from '../types.ts';
import { canUploadVideo } from '../utils/auth.ts';

interface VideoCardProps {
  video: Video;
  currentUser: User | null;
  onSelect: (video: Video) => void;
  onDeleteVideo?: (videoId: string) => void;
  isSelected?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  currentUser,
  onSelect,
  onDeleteVideo,
  isSelected,
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
      const filename = `NovaStream_${cleanTitle}.mp4`;

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
      a.download = `NovaStream_${video.id}.mp4`;
      a.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar "${video.title}" del catálogo exclusivo?`)) {
      onDeleteVideo?.(video.id);
    }
  };

  const formattedViews =
    video.views >= 1000000
      ? `${(video.views / 1000000).toFixed(1)}M`
      : video.views >= 1000
      ? `${(video.views / 1000).toFixed(0)}K`
      : video.views;

  return (
    <div
      onClick={() => onSelect(video)}
      className={`group relative flex flex-col bg-neutral-900/90 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 ${
        isSelected
          ? 'border-red-500 shadow-lg shadow-red-500/20'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-mono font-semibold text-white border border-white/10">
          {video.durationFormatted}
        </div>

        {/* Quality Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-red-600/90 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
          {video.quality}
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Admin exclusive management button overlay */}
        {isAdmin && onDeleteVideo && (
          <button
            type="button"
            onClick={handleDeleteClick}
            aria-label="Eliminar video (Admin)"
            title="Eliminar del catálogo (Exclusivo Administrador)"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-neutral-300 hover:text-white border border-white/20 transition-colors z-10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
              {video.category}
            </span>
            {video.featured && (
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Destacado
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h4>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-neutral-500" />
              {formattedViews}
            </span>
            <span>•</span>
            <span className="text-[11px]">{video.uploadedAt}</span>
          </div>

          {/* Quick Download Button on card */}
          <button
            type="button"
            onClick={handleDownloadClick}
            aria-label={`Descargar ${video.title}`}
            title="Descargar este video en MP4"
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            {downloading ? (
              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : downloaded ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-red-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
