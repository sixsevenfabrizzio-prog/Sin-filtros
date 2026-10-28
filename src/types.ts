export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string;
  views: number;
  likes: number;
  uploadedAt: string;
  author: string;
  authorRole: UserRole;
  category: string;
  tags: string[];
  quality: '4K' | '1080p' | '720p';
  fileSizeMb: number;
  featured?: boolean;
  isShort?: boolean;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'upload' | 'comment' | 'user' | 'system';
  read: boolean;
}

