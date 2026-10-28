import { Video } from '../types.ts';

// By default, the catalog starts empty until the authorized Administrator uploads videos!
export const INITIAL_VIDEOS: Video[] = [];

// Templates and high quality sample media ready for the Administrator to easily publish:
export const ADMIN_VIDEO_TEMPLATES = [
  {
    title: 'Tears of Steel - Proyecto Sci-Fi en 4K UHD',
    description: 'En un futuro distópico, un grupo de científicos y rebeldes intenta reiniciar una red de comunicación cuántica en la torre de la catedral de Ámsterdam para salvar el planeta.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    duration: 734,
    formatted: '12:14',
    quality: '4K' as const,
    category: 'Cine & Animación',
    tags: ['Sci-Fi', 'VFX', 'CGI', '4K'],
  },
  {
    title: 'Sintel - La Búsqueda del Dragón Legendario',
    description: 'Una joven solitaria rescata a un dragón herido al que llama Scales. Cuando el dragón es arrebatado por una criatura mayor, inicia un peligroso viaje por tierras desconocidas.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    duration: 888,
    formatted: '14:48',
    quality: '1080p' as const,
    category: 'Cine & Animación',
    tags: ['Fantasía', 'Dragón', 'Animación', 'Cine'],
  },
  {
    title: 'Big Buck Bunny - Clásico Animado Full HD',
    description: 'El simpático conejo gigante del bosque decide darle una lección a un trío de ardillas y roedores traviesos que destruyeron sus mariposas favoritas.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&auto=format&fit=crop&q=80',
    duration: 596,
    formatted: '09:56',
    quality: '1080p' as const,
    category: 'Cine & Animación',
    tags: ['Animación', 'Comedia', 'Clásico', '1080p'],
  },
  {
    title: 'Expedición Extrema: En Busca de la Naturaleza Salvaje',
    description: 'Un recorrido cinematográfico por cañones profundos, montañas nevadas y costas vírgenes filmado con drones y cámaras de cine digital de última generación.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    duration: 15,
    formatted: '00:15',
    quality: '4K' as const,
    category: 'Naturaleza',
    tags: ['Aventura', 'Montañas', 'Drones', '4K'],
  },
];
