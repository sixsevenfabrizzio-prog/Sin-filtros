import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  X,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Film,
  Clapperboard,
} from 'lucide-react';
import { User, Video } from '../types.ts';
import { canUploadVideo, isShortVideo } from '../utils/auth.ts';
import { ADMIN_VIDEO_TEMPLATES } from '../data/initialVideos.ts';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUploadSuccess: (video: Video) => void;
  customCategories: string[];
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUploadSuccess,
  customCategories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(customCategories[1] || customCategories[0] || 'General');
  const [quality, setQuality] = useState<'4K' | '1080p' | '720p'>('1080p');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationSecs, setDurationSecs] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Sync category if customCategories change
  useEffect(() => {
    if (customCategories.length > 0 && !customCategories.includes(category)) {
      setCategory(customCategories[1] || customCategories[0] || 'General');
    }
  }, [customCategories, category]);

  if (!isOpen) return null;

  const isAdmin = canUploadVideo(currentUser);
  const isDetectedShort = isShortVideo(durationSecs);

  const handlePresetSelect = (preset: (typeof ADMIN_VIDEO_TEMPLATES)[0]) => {
    setTitle(preset.title);
    setVideoUrl(preset.videoUrl);
    setThumbnailUrl(preset.thumbnailUrl);
    setDescription(preset.description);
    setQuality(preset.quality);
    setDurationSecs(preset.duration);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      // Try reading video duration directly from file
      const tempVideo = document.createElement('video');
      tempVideo.src = objectUrl;
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration) {
          const detectedSecs = Math.round(tempVideo.duration);
          setDurationSecs(detectedSecs);
        }
      };
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!title.trim() || !videoUrl.trim()) {
      alert('Por favor ingresa un título y la fuente del video');
      return;
    }

    setIsSubmitting(true);

    const m = Math.floor(durationSecs / 60);
    const s = durationSecs % 60;
    const formattedDuration = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;

    const newVideo: Video = {
      id: `vid-admin-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Video publicado en SinFiltros.',
      videoUrl: videoUrl.trim(),
      thumbnailUrl:
        thumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
      duration: durationSecs,
      durationFormatted: formattedDuration,
      views: 0,
      likes: 0,
      uploadedAt: 'Recién subido',
      author: currentUser?.username || 'Administrador',
      authorRole: 'admin',
      category: category === 'Todos' ? 'General' : category,
      tags: [category, isDetectedShort ? 'Shorts' : 'Video'],
      quality,
      fileSizeMb: Math.max(5, Math.round(durationSecs * 0.16 * 10) / 10),
      isShort: isDetectedShort,
    };

    setTimeout(() => {
      onUploadSuccess(newVideo);
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setThumbnailUrl('');
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="relative w-full max-w-xl bg-[#1f1f1f] border border-[#383838] rounded-2xl shadow-2xl p-6 my-auto text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAdmin ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Acceso Exclusivo de Administrador</h3>
            <p className="text-xs text-[#aaaaaa] max-w-md mx-auto mb-4">
              Solo los administradores autorizados con la contraseña maestra pueden subir videos y shorts para mantener el orden.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#2a2a2a] hover:bg-[#383838] text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#333333]">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Subir video a SinFiltros
                </h3>
                <p className="text-xs text-[#aaaaaa]">
                  Simple, rápido y con detección automática de Shorts (≤ 30s)
                </p>
              </div>
            </div>

            {successMessage ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-14 h-14 text-purple-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-base font-bold text-white mb-1">
                  {isDetectedShort ? '¡Short publicado con éxito!' : '¡Video publicado con éxito!'}
                </h4>
                <p className="text-xs text-[#aaaaaa]">Ya está disponible en la plataforma.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Video Source (File or URL) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    1. Video (Archivo MP4 o URL) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileChange}
                      className="w-full text-xs text-neutral-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2b2b2b] file:text-white hover:file:bg-[#383838] cursor-pointer bg-[#141414] border border-[#333333] rounded-xl p-1"
                    />

                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="O pega URL de video..."
                        className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration & Shorts Detection Banner as requested by user */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      Duración en segundos
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7200}
                      value={durationSecs}
                      onChange={(e) => setDurationSecs(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* Automatic Shorts Detection Indicator */}
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                      isDetectedShort
                        ? 'bg-purple-950/40 border-purple-500/50 text-purple-200'
                        : 'bg-[#181818] border-[#303030] text-[#aaaaaa]'
                    }`}
                  >
                    {isDetectedShort ? (
                      <>
                        <Clapperboard className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white text-[11px]">⚡ Detectado como Short</p>
                          <p className="text-[10px] text-purple-300">Dura ≤ 30s. Se pondrá en Shorts.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4 text-neutral-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-white text-[11px]">Video Estándar</p>
                          <p className="text-[10px] text-neutral-400">Dura más de 30s.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    2. Título del Video o Short *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título llamativo..."
                    className="w-full px-4 py-2 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {/* Category (from the Admin's custom categories) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {customCategories
                        .filter((c) => c !== 'Todos')
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      Calidad
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="1080p">1080p Full HD</option>
                      <option value="4K">4K Ultra HD</option>
                      <option value="720p">720p HD</option>
                    </select>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    3. Miniatura (Subir imagen o pegar URL)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileChange}
                      className="w-full text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2b2b2b] file:text-white cursor-pointer bg-[#141414] border border-[#333333] rounded-xl p-1"
                    />
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://.../portada.jpg"
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Quick Presets for Admin Testing */}
                <div className="p-2.5 bg-[#141414] rounded-xl border border-[#2b2b2b]">
                  <p className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Videos de muestra listos para publicar:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ADMIN_VIDEO_TEMPLATES.map((p) => (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className="px-2.5 py-1 rounded-lg bg-[#272727] hover:bg-[#383838] text-[11px] text-white transition-colors"
                      >
                        {p.title.split(' - ')[0]} ({p.duration <= 30 ? '⚡ Short' : p.formatted})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end gap-2 border-t border-[#333333]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full bg-[#272727] hover:bg-[#383838] text-xs font-semibold text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Publicar en SinFiltros</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
