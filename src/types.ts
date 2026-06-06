export type Category = 'roads' | 'garbage' | 'lighting' | 'safety' | 'ecology' | 'other';

export const CategoryNames: Record<Category, string> = {
  roads: 'Дороги',
  garbage: 'Мусор',
  lighting: 'Освещение',
  safety: 'Безопасность',
  ecology: 'Экология',
  other: 'Другое',
};

export const CategoryColors: Record<Category, string> = {
  roads: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900',
  garbage: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  lighting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
  safety: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900',
  ecology: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  other: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800',
};

export type PostStatus = 'unverified' | 'partially_confirmed' | 'confirmed';

export const StatusNames: Record<PostStatus, string> = {
  unverified: 'Не проверено',
  partially_confirmed: 'Частично подтверждено',
  confirmed: 'Подтверждено',
};

export const StatusColors: Record<PostStatus, string> = {
  unverified: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800',
  partially_confirmed: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
};

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  reputation: number;
  post_count: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  description: string;
  image_url: string;
  category: Category;
  latitude: number;
  longitude: number;
  status: PostStatus;
  created_at: string;
  votes_confirm: number;
  votes_refute: number;
  user_vote?: 'confirm' | 'refute'; // Vote cast by current user, if signed in
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  author_name: string;
  author_avatar: string;
  text: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    username: string;
    avatar_url: string;
    reputation: number;
  } | null;
  token: string | null;
}
