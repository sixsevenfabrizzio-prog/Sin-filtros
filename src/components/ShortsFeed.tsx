import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Download,
  RotateCw,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Crown,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Video, User } from '../types.ts';

interface ShortsFeedProps {
  shorts: Video[];
  currentUser: User | null;
  onOpenUpload: () => void;
  isAdmin: boolean;
  likedVideoIds: string[];
  onToggleLike: (id: string) => void;
  onPromptLogin: () => void;
  isMobile?: boolean;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  shorts,
  currentUser,
  onOpenUpload,
  isAdmin,
  likedVideoIds,
  onToggleLike,
  onPromptLogin,
  isMobile,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentShort = shorts[activeIndex];

  const handleNext = () => {
    if (activeIndex < shorts.length - 1) {
      setActiveIndex(activeIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const forward10 = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
  };

  const rewind10 = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleDownload = async () => {
    if (!currentShort) return;
    try {
      const a = document.createElement('a');
      a.href = currentShort.videoUrl;
      a.target = '_blank';
      a.download = `SinFiltros_Short_${currentShort.id}.mp4`;
      a.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      window.open(currentShort.videoUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (shorts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md p-8 rounded-2xl bg-[#181818] border border-[#282828]">
          <div className="w-14 h-14 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No hay Shorts disponibles</h3>
          <p className="text-xs text-[#aaaaaa] leading-relaxed mb-6">
            Los videos con duración de <strong>30 segundos o menos</strong> se detectan automáticamente y se colocan aquí como Shorts.
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30 inline-flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4" />
              <span>Subir un Short (≤ 30s) como Admin</span>
            </button>
          ) : (
            <p className="text-[11px] text-neutral-500 italic">
              El Administrador publicará nuevos shorts próximamente.
            </p>
          )}
        </div>
      </div>
    );
  }

  const isLiked = currentShort ? likedVideoIds.includes(currentShort.id) : false;

  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      <div className="relative flex items-end sm:items-center gap-4">
        {/* Main Vertical Short Player 9:16 (Adaptive for Mobile / Tablet / PC) */}
        <div className={`relative ${isMobile ? 'w-[calc(100vw-5.5rem)] max-w-[360px] h-[calc(100vh-8.5rem)]' : 'w-[340px] sm:w-[380px] h-[calc(100vh-8rem)]'} max-h-[720px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#282828]`}>
          <video
            ref={videoRef}
            key={currentShort.id}
            src={currentShort.videoUrl}
            poster={currentShort.thumbnailUrl}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />

          {/* Top Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-20">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-bold uppercase tracking-wider">
                Short
              </span>
              <span className="text-[11px] font-mono text-purple-200">
                {currentShort.durationFormatted}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
            </div>
          </div>

          {/* Forward / Rewind floating 10s buttons */}
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={rewind10}
              className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
              title="Retroceder 10s"
            >
              <RotateCcw className="w-5 h-5 text-purple-300" />
            </button>
            <button
              type="button"
              onClick={forward10}
              className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
              title="Adelantar 10s"
            >
              <RotateCw className="w-5 h-5 text-purple-300" />
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white z-20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-300">
                {currentShort.author.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold truncate">@{currentShort.author}</span>
              {currentShort.authorRole === 'admin' && (
                <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-0.5">
                  <Crown className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold leading-snug line-clamp-2">
              {currentShort.title}
            </h4>

            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-purple-300 font-medium">
              <span className="px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-500/30">
                #{currentShort.category}
              </span>
              <span>•</span>
              <span className="text-[#aaaaaa]">{currentShort.views} vistas</span>
            </div>
          </div>
        </div>

        {/* Right Action Bar (YouTube Shorts side buttons) */}
        <div className="flex flex-col items-center gap-4 py-2 shrink-0">
          {/* Like */}
          <button
            type="button"
            onClick={() => onToggleLike(currentShort.id)}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div
              className={`p-3 rounded-full bg-[#272727] group-hover:bg-[#383838] transition-colors ${
                isLiked ? 'text-purple-400 bg-purple-950/50 border border-purple-500/40' : ''
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[11px] font-semibold text-[#aaaaaa] group-hover:text-white">
              {currentShort.likes}
            </span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div className="p-3 rounded-full bg-[#272727] group-hover:bg-[#383838] transition-colors">
              {copiedLink ? <Check className="w-5 h-5 text-purple-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-[#aaaaaa]">Compartir</span>
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex flex-col items-center gap-1 text-white group"
            title="Descargar Short en MP4"
          >
            <div className="p-3 rounded-full bg-[#272727] group-hover:bg-[#383838] transition-colors text-purple-400">
              {downloadSuccess ? <Check className="w-5 h-5 text-emerald-400" /> : <Download className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-[#aaaaaa]">Descargar</span>
          </button>

          {/* Prev / Next Short Navigation buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-2.5 rounded-full bg-[#272727] hover:bg-[#383838] text-white disabled:opacity-30 disabled:hover:bg-[#272727] transition-all"
              title="Short anterior"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === shorts.length - 1}
              className="p-2.5 rounded-full bg-[#272727] hover:bg-[#383838] text-white disabled:opacity-30 disabled:hover:bg-[#272727] transition-all"
              title="Siguiente short"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
