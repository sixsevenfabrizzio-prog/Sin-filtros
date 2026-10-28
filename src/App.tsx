import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Film, Sparkles, History as HistoryIcon, Clapperboard, Trash2, Play } from 'lucide-react';
import { User, Video, VideoComment } from './types.ts';
import { STORAGE_KEYS, canUploadVideo } from './utils/auth.ts';
import { YouTubeHeader } from './components/YouTubeHeader.tsx';
import { YouTubeSidebar } from './components/YouTubeSidebar.tsx';
import { YouTubeChips } from './components/YouTubeChips.tsx';
import { YouTubeVideoCard } from './components/YouTubeVideoCard.tsx';
import { YouTubeWatchPage } from './components/YouTubeWatchPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { VideoUploadModal } from './components/VideoUploadModal.tsx';
import { AdminPanelModal } from './components/AdminPanelModal.tsx';
import { CategoryManagerModal } from './components/CategoryManagerModal.tsx';
import { EditProfileModal } from './components/EditProfileModal.tsx';
import { ShortsFeed } from './components/ShortsFeed.tsx';
import { useDeviceDetector } from './utils/deviceDetector.ts';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';

export default function App() {
  const device = useDeviceDetector();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Videos catalog: strictly starts empty until an admin uploads
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEOS_LIST);
      if (stored) {
        const parsed: Video[] = JSON.parse(stored);
        return parsed.filter((v) => v.id.startsWith('vid-admin-'));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Dynamic customizable categories (Admin can add, rename, remove)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES_LIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return ['Todos', 'General', 'Tendencias', 'Exclusivos'];
    } catch {
      return ['Todos', 'General', 'Tendencias', 'Exclusivos'];
    }
  });

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'Principal' | 'Shorts' | 'Historial'>('Principal');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return !currentUser;
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAdminStudioOpen, setIsAdminStudioOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [likedVideoIds, setLikedVideoIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LIKED_VIDEOS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [watchedHistoryIds, setWatchedHistoryIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY_VIDEOS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, VideoComment[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS_MAP);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync states to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS_LIST, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES_LIST, JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify(likedVideoIds));
  }, [likedVideoIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY_VIDEOS, JSON.stringify(watchedHistoryIds));
  }, [watchedHistoryIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS_MAP, JSON.stringify(commentsMap));
  }, [commentsMap]);

  const isAdmin = canUploadVideo(currentUser);

  // Shorts list: videos with duration <= 30 seconds
  const shortsList = useMemo(() => {
    return videos.filter((v) => v.isShort || v.duration <= 30);
  }, [videos]);

  // Regular filtered videos for Principal tab
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.author.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category Chip
      if (selectedCategory === 'Todos') return true;
      if (selectedCategory === 'Tendencias') return (v.views || 0) >= 1;
      return v.category.toLowerCase().includes(selectedCategory.toLowerCase());
    });
  }, [videos, searchQuery, selectedCategory]);

  // History list
  const historyVideos = useMemo(() => {
    return watchedHistoryIds
      .map((id) => videos.find((v) => v.id === id))
      .filter((v): v is Video => !!v);
  }, [watchedHistoryIds, videos]);

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setWatchedHistoryIds((prev) => [video.id, ...prev.filter((id) => id !== video.id)]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleRegisterNewUser = (user: User) => {
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id || u.username === user.username);
      if (exists) return prev;
      return [...prev, user];
    });
  };

  const handleUpdateProfile = (updated: User) => {
    setCurrentUser(updated);
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const handleUploadVideo = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
    if (newVideo.isShort || newVideo.duration <= 30) {
      setSidebarTab('Shorts');
    } else {
      setSelectedVideo(newVideo);
      setWatchedHistoryIds((prev) => [newVideo.id, ...prev.filter((id) => id !== newVideo.id)]);
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!isAdmin) return;
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setWatchedHistoryIds((prev) => prev.filter((id) => id !== videoId));
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const toggleLikeVideo = (videoId: string) => {
    const isLiked = likedVideoIds.includes(videoId);
    setLikedVideoIds((prev) =>
      isLiked ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          return {
            ...v,
            likes: isLiked ? Math.max(0, v.likes - 1) : v.likes + 1,
          };
        }
        return v;
      })
    );

    if (selectedVideo?.id === videoId) {
      setSelectedVideo((prev) =>
        prev
          ? {
              ...prev,
              likes: isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
            }
          : null
      );
    }
  };

  const handleAddComment = (text: string) => {
    if (!selectedVideo || !currentUser) return;

    const newComment: VideoComment = {
      id: `comm_${Date.now()}`,
      videoId: selectedVideo.id,
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      text,
      createdAt: 'Hace un momento',
      likes: 0,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [selectedVideo.id]: [newComment, ...(prev[selectedVideo.id] || [])],
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedVideo) return;
    setCommentsMap((prev) => ({
      ...prev,
      [selectedVideo.id]: (prev[selectedVideo.id] || []).filter((c) => c.id !== commentId),
    }));
  };

  const handleLikeComment = (commentId: string) => {
    if (!selectedVideo) return;
    setCommentsMap((prev) => ({
      ...prev,
      [selectedVideo.id]: (prev[selectedVideo.id] || []).map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ),
    }));
  };

  return (
    <div className={`min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white ${device.isMobile ? 'pb-16' : ''}`}>
      {/* SinFiltros Header (Brand purple, adaptive device detector, exclusive notifications bell for Admin) */}
      <YouTubeHeader
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenCategories={() => setIsCategoryManagerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => {}}
        deviceInfo={device}
        currentDevice={device.deviceType}
        forcedDevice={device.forcedDevice}
        onSetForcedDevice={device.setForcedDevice}
        isMobile={device.isMobile}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex">
        {/* Simplified Sidebar (Principal, Shorts, Historial) - Hidden on Mobile, Mini rail on Tablet */}
        {!selectedVideo && !device.isMobile && (
          <YouTubeSidebar
            isOpen={device.isTablet ? false : isSidebarOpen}
            activeTab={sidebarTab}
            onSelectTab={(tab) => {
              setSidebarTab(tab as any);
              if (tab === 'Principal') {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }
            }}
            currentUser={currentUser}
            onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenCategories={() => setIsCategoryManagerOpen(true)}
          />
        )}

        {/* Content View */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedVideo ? (
            /* Watch Page with +10s forward, -10s rewind, download, and comments */
            <YouTubeWatchPage
              video={selectedVideo}
              allVideos={videos}
              currentUser={currentUser}
              onBackToHome={() => setSelectedVideo(null)}
              onSelectVideo={handleSelectVideo}
              onDeleteVideo={handleDeleteVideo}
              comments={commentsMap[selectedVideo.id] || []}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onLikeComment={handleLikeComment}
              onPromptLogin={() => setIsAuthModalOpen(true)}
              isLiked={likedVideoIds.includes(selectedVideo.id)}
              onToggleLike={toggleLikeVideo}
            />
          ) : sidebarTab === 'Shorts' ? (
            /* Dedicated Shorts Feed with 9:16 vertical player and auto-loop */
            <ShortsFeed
              shorts={shortsList}
              currentUser={currentUser}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              isAdmin={isAdmin}
              likedVideoIds={likedVideoIds}
              onToggleLike={toggleLikeVideo}
              onPromptLogin={() => setIsAuthModalOpen(true)}
              isMobile={device.isMobile}
            />
          ) : sidebarTab === 'Historial' ? (
            /* Historial View */
            <div className="flex-1 p-6 max-w-4xl">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#282828]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <HistoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Historial de reproducciones</h2>
                    <p className="text-xs text-[#aaaaaa]">Videos que has visto en SinFiltros</p>
                  </div>
                </div>
                {historyVideos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setWatchedHistoryIds([])}
                    className="px-3 py-1.5 rounded-full bg-[#272727] hover:bg-rose-900/40 text-xs text-neutral-300 hover:text-rose-300 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar historial</span>
                  </button>
                )}
              </div>

              {historyVideos.length === 0 ? (
                <div className="text-center py-16 bg-[#181818] rounded-2xl border border-[#282828] p-8">
                  <Film className="w-10 h-10 text-neutral-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">Tu historial está vacío</p>
                  <p className="text-xs text-[#888888] mt-1">
                    Los videos que reproduzcas aparecerán aquí para fácil acceso.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyVideos.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVideo(v)}
                      className="flex gap-4 p-3 rounded-2xl bg-[#161616] hover:bg-[#202020] border border-[#282828] cursor-pointer transition-colors group"
                    >
                      <div className="relative w-44 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 font-mono text-[10px] text-white">
                          {v.durationFormatted}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {v.title}
                          </h4>
                          <p className="text-xs text-[#aaaaaa] mt-1 line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#777777]">
                          <span className="text-purple-300 font-medium">@{v.author}</span>
                          <span>•</span>
                          <span>{v.views} vistas</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Home / Principal Video Feed */
            <div className="flex-1 flex flex-col">
              {/* Dynamic Customizable Category Chips Bar */}
              <YouTubeChips
                categories={customCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                isAdmin={isAdmin}
                onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
              />

              {/* Admin Banner if Admin */}
              {isAdmin && (
                <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>
                      <strong>Administrador Exclusivo:</strong> Solo tú tienes permisos para subir videos, shorts y editar categorías.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCategoryManagerOpen(true)}
                      className="px-3 py-1.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-medium text-xs border border-purple-500/30 transition-colors"
                    >
                      Editar Categorías
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      + Subir contenido
                    </button>
                  </div>
                </div>
              )}

              {/* Main Grid Area */}
              <main className="flex-1 p-4 sm:p-6">
                {filteredVideos.length === 0 ? (
                  videos.length === 0 ? (
                    /* Initial Clean Empty State */
                    <div className="max-w-xl mx-auto my-16 text-center p-8 rounded-2xl bg-[#181818] border border-[#282828] shadow-2xl">
                      {isAdmin ? (
                        <div>
                          <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            Tu canal de SinFiltros está listo
                          </h3>
                          <p className="text-sm text-[#aaaaaa] leading-relaxed mb-6">
                            No hay ningún video precargado. Solo tú, como <strong>Administrador Exclusivo</strong> (con la contraseña maestra), tienes autorización para subir videos y organizar el canal.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-600/30"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Subir tu primer video o short a SinFiltros</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="w-16 h-16 rounded-full bg-[#272727] text-[#aaaaaa] flex items-center justify-center mx-auto mb-4">
                            <Film className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            No hay videos disponibles
                          </h3>
                          <p className="text-sm text-[#aaaaaa] leading-relaxed mb-4">
                            Para mantener el orden de la plataforma, <strong>únicamente el Administrador Exclusivo puede subir videos</strong>. No hay videos precargados.
                          </p>
                          <p className="text-xs text-[#717171]">
                            Si eres el administrador, inicia sesión con la contraseña maestra autorizada para comenzar a subir contenido.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Film className="w-12 h-12 text-[#444444] mx-auto mb-3" />
                      <h4 className="text-base font-semibold text-white">No se encontraron videos</h4>
                      <p className="text-xs text-[#888888] mt-1">
                        Prueba con otros términos de búsqueda o selecciona otra categoría.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-8">
                    {/* Shorts Reel Shelf on Home (if shorts exist) */}
                    {shortsList.length > 0 && selectedCategory === 'Todos' && !searchQuery && (
                      <div className="pb-6 border-b border-[#282828]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clapperboard className="w-5 h-5 text-purple-400" />
                            <h3 className="text-base font-bold text-white">Shorts (≤ 30 segundos)</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSidebarTab('Shorts')}
                            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Ver todos
                          </button>
                        </div>

                        <div
                          className={
                            device.isMobile
                              ? 'grid grid-cols-2 gap-2.5'
                              : device.isTablet
                              ? 'grid grid-cols-3 gap-3'
                              : device.isLaptop
                              ? 'grid grid-cols-4 gap-3.5'
                              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                          }
                        >
                          {shortsList.slice(0, 5).map((short) => (
                            <div
                              key={short.id}
                              onClick={() => {
                                setSidebarTab('Shorts');
                              }}
                              className="group cursor-pointer flex flex-col"
                            >
                              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-[#2b2b2b]">
                                <img
                                  src={short.thumbnailUrl}
                                  alt={short.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-purple-600 text-[10px] font-bold text-white">
                                  Short
                                </div>
                                <div className="absolute bottom-2 left-2 right-2 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                  <p className="text-xs font-semibold text-white line-clamp-2">
                                    {short.title}
                                  </p>
                                  <span className="text-[10px] text-purple-300">
                                    {short.durationFormatted}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Videos Responsive Grid (Adaptive to Mobile, Tablet, Laptop, Desktop PC) */}
                    <div>
                      {shortsList.length > 0 && selectedCategory === 'Todos' && !searchQuery && (
                        <h3 className="text-base font-bold text-white mb-4">Videos</h3>
                      )}
                      <div
                        className={
                          device.isMobile
                            ? 'grid grid-cols-1 gap-y-5'
                            : device.isTablet
                            ? 'grid grid-cols-2 gap-4'
                            : device.isLaptop
                            ? 'grid grid-cols-3 gap-5'
                            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8'
                        }
                      >
                        {filteredVideos.map((video) => (
                          <YouTubeVideoCard
                            key={video.id}
                            video={video}
                            currentUser={currentUser}
                            onSelect={handleSelectVideo}
                            onDeleteVideo={handleDeleteVideo}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal (Appears upon entry or when requested) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleLoginSuccess}
        registeredUsers={registeredUsers}
        onRegisterUser={handleRegisterNewUser}
      />

      {/* Video Upload Modal (Exclusive for Admin, includes Shorts detection) */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentUser={currentUser}
        onUploadSuccess={handleUploadVideo}
        customCategories={customCategories}
      />

      {/* Admin Studio Channel Management Modal */}
      <AdminPanelModal
        isOpen={isAdminStudioOpen}
        onClose={() => setIsAdminStudioOpen(false)}
        currentUser={currentUser}
        videos={videos}
        onDeleteVideo={handleDeleteVideo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Admin Categories Management Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={customCategories}
        onUpdateCategories={setCustomCategories}
        isAdmin={isAdmin}
      />

      {/* Edit Profile Modal (Photo from gallery + username) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Mobile Bottom Navigation Bar (YouTube Mobile Experience) */}
      {device.isMobile && (
        <MobileBottomNav
          activeTab={sidebarTab}
          onSelectTab={(tab) => {
            setSidebarTab(tab as any);
            if (tab === 'Principal') {
              setSelectedCategory('Todos');
              setSearchQuery('');
            }
          }}
          currentUser={currentUser}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenProfile={() => setIsEditProfileOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}
    </div>
  );
}
