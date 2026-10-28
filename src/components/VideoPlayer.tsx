import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Settings,
  Check,
  Flame,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Video } from '../types.ts';

interface VideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, autoPlay = true, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [rippleFeedback, setRippleFeedback] = useState<'forward' | 'rewind' | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setSpeedMenuOpen(false);
      }
    }, 2800);
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Jump 10 seconds forward (+10s)
  const forward10Seconds = useCallback(() => {
    if (!videoRef.current) return;
    const target = Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    setRippleFeedback('forward');
    setTimeout(() => setRippleFeedback(null), 650);
  }, [duration]);

  // Jump 10 seconds back (-10s)
  const rewind10Seconds = useCallback(() => {
    if (!videoRef.current) return;
    const target = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    setRippleFeedback('rewind');
    setTimeout(() => setRippleFeedback(null), 650);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedMenuOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Real file download trigger
  const handleDownload = async () => {
    if (downloadStatus === 'downloading') return;
    setDownloadStatus('downloading');
    setDownloadProgress(10);

    try {
      const cleanTitle = video.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `NovaStream_${cleanTitle}.mp4`;

      // Simulating realistic buffered stream download or direct browser download
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 25;
        });
      }, 180);

      const response = await fetch(video.videoUrl, { mode: 'cors' }).catch(() => null);

      clearInterval(interval);
      setDownloadProgress(100);

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
        // Fallback standard direct download
        const a = document.createElement('a');
        a.href = video.videoUrl;
        a.target = '_blank';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setDownloadStatus('completed');
      setTimeout(() => setDownloadStatus('idle'), 4000);
    } catch {
      // In case of any browser security restriction, direct download link
      const a = document.createElement('a');
      a.href = video.videoUrl;
      a.target = '_blank';
      a.download = `NovaStream_Video_${video.id}.mp4`;
      a.click();
      setDownloadStatus('completed');
      setTimeout(() => setDownloadStatus('idle'), 4000);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        forward10Seconds();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        rewind10Seconds();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, forward10Seconds, rewind10Seconds]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border border-neutral-800"
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            if (autoPlay) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        playsInline
      />

      {/* Ripple Animation Feedback for +10s / -10s YouTube style */}
      {rippleFeedback === 'forward' && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-30 bg-black/80 backdrop-blur-md px-6 py-4 rounded-full border border-purple-500/30 animate-pulse text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <RotateCw className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-sm font-bold mt-1 text-white">+10 seg</span>
        </div>
      )}

      {rippleFeedback === 'rewind' && (
        <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-30 bg-black/80 backdrop-blur-md px-6 py-4 rounded-full border border-purple-500/30 animate-pulse text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <RotateCcw className="w-8 h-8 text-purple-400" />
          <span className="text-sm font-bold mt-1 text-white">-10 seg</span>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 flex items-center justify-between ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-4">
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-600 text-white uppercase tracking-wider">
            {video.quality}
          </span>
          <h3 className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">
            {video.title}
          </h3>
        </div>

        {/* Quick direct download button on player header */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadStatus === 'downloading'}
          aria-label="Descargar video"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#272727]/90 hover:bg-[#3f3f3f] text-white text-xs font-medium border border-neutral-700/60 backdrop-blur transition-all shadow-md shrink-0"
        >
          {downloadStatus === 'downloading' ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Descargando ({downloadProgress}%)...</span>
            </>
          ) : downloadStatus === 'completed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300">¡Descargado!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Descargar ({video.fileSizeMb} MB)</span>
            </>
          )}
        </button>
      </div>

      {/* Center Play Button Overlay when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer z-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border border-purple-400/40 shadow-purple-600/30">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar / Scrubber - YouTube Purple */}
        <div className="group/progress relative flex items-center mb-2 sm:mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Línea de tiempo del video"
            className="w-full h-1.5 group-hover/progress:h-2.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          {/* Left Controls: Play, Rewind 10s, Forward 10s, Volume, Time */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* REWIND 10 SECONDS BUTTON */}
            <button
              type="button"
              onClick={rewind10Seconds}
              aria-label="Retroceder 10 segundos"
              title="Retroceder 10 segundos (Flecha Izquierda)"
              className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
              <span className="text-[10px] font-bold sm:inline hidden">-10s</span>
            </button>

            {/* FORWARD 10 SECONDS BUTTON - Highlighted feature requested by user */}
            <button
              type="button"
              onClick={forward10Seconds}
              aria-label="Adelantar 10 segundos"
              title="Adelantar 10 segundos (Flecha Derecha)"
              className="relative p-1.5 px-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 transition-colors text-white flex items-center gap-1 font-semibold shadow-sm"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
              <span className="text-[11px] font-bold text-purple-200">+10s</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Control de volumen"
                className="w-14 sm:w-20 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Time Indicator */}
            <div className="text-[11px] sm:text-xs text-neutral-300 font-mono ml-2">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-neutral-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Download, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                aria-label="Velocidad de reproducción"
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium font-mono"
              >
                {playbackSpeed}x
              </button>

              {speedMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#282828] border border-[#383838] rounded-xl shadow-xl py-1 w-28 z-40">
                  <div className="text-[10px] uppercase font-semibold text-neutral-400 px-3 py-1 border-b border-[#383838]">
                    Velocidad
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 flex items-center justify-between"
                    >
                      <span>{spd}x</span>
                      {playbackSpeed === spd && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Button in control bar */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Descargar este video"
              title="Descargar archivo de video"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-200 hover:text-white"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
