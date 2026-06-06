import { create } from 'zustand';
import { Post, Comment, Notification, Category, PostStatus } from '../types';
import { apiService } from '../services/api';

interface FilterState {
  search: string;
  category: string;
  status: string;
}

interface AppStore {
  // Authentication & Profile
  user: any | null;
  authChecked: boolean;
  isAuthModalOpen: boolean;
  activeProfileUserId: string | null;

  // View control
  activePostId: string | null;
  isCreatePostOpen: boolean;
  selectedMapCoords: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;

  // UI state
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data collections
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  isPostsLoading: boolean;

  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Actions
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
  setCreatePostOpen: (isOpen: boolean, coords?: { lat: number; lng: number } | null) => void;
  setActivePostId: (id: string | null) => void;
  setActiveProfileUserId: (userId: string | null) => void;

  // API wrappers
  fetchPosts: () => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  
  createPost: (postData: {
    title: string;
    description: string;
    image_url?: string;
    category: Category;
    latitude: number;
    longitude: number;
  }) => Promise<Post>;
  
  castVote: (postId: string, voteType: 'confirm' | 'refute') => Promise<void>;
  submitComment: (postId: string, text: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  authChecked: false,
  isAuthModalOpen: false,
  activeProfileUserId: null,
  
  activePostId: null,
  isCreatePostOpen: false,
  selectedMapCoords: null,
  userLocation: null,

  theme: 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pravda_ryadom_theme', nextTheme);
  },

  posts: [],
  comments: [],
  notifications: [],
  isPostsLoading: false,

  filters: {
    search: '',
    category: 'all',
    status: 'all',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchPosts();
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        category: 'all',
        status: 'all',
      },
    });
    get().fetchPosts();
  },

  setUser: (user) => set({ user }),
  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  setActivePostId: (id) => set({ activePostId: id }),
  setActiveProfileUserId: (userId) => set({ activeProfileUserId: userId }),

  setCreatePostOpen: (isOpen, coords = null) => {
    set({ 
      isCreatePostOpen: isOpen,
      selectedMapCoords: coords || null
    });
  },

  checkAuth: async () => {
    // Initial theme load
    const storedTheme = localStorage.getItem('pravda_ryadom_theme') as 'light' | 'dark';
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      set({ theme: 'dark' });
      document.documentElement.classList.add('dark');
    } else {
      set({ theme: 'light' });
      document.documentElement.classList.remove('dark');
    }

    // Geolocation retrieval helper
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set({ userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        },
        () => {
          // Default to Moscow city center
          set({ userLocation: { lat: 55.7558, lng: 37.6173 } });
        }
      );
    } else {
      set({ userLocation: { lat: 55.7558, lng: 37.6173 } });
    }

    try {
      const user = await apiService.getCurrentUser();
      set({ user, authChecked: true });
      if (user) {
        get().fetchNotifications();
      }
    } catch (e) {
      set({ authChecked: true });
    }
  },

  fetchPosts: async () => {
    set({ isPostsLoading: true });
    try {
      const { filters } = get();
      const posts = await apiService.getPosts({
        search: filters.search,
        category: filters.category,
        status: filters.status,
      });
      set({ posts, isPostsLoading: false });
    } catch (e) {
      console.error('Failed to fetch posts', e);
      set({ isPostsLoading: false });
    }
  },

  fetchComments: async (postId) => {
    try {
      const comments = await apiService.getComments(postId);
      set({ comments });
    } catch (e) {
      console.error('Failed to fetch comments', e);
    }
  },

  fetchNotifications: async () => {
    if (!get().user) return;
    try {
      const notifications = await apiService.getNotifications();
      set({ notifications });
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  },

  createPost: async (postData) => {
    const post = await apiService.createPost(postData);
    set((state) => ({ posts: [post, ...state.posts] }));
    // update current user's locally computed stats/reputation if needed
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, reputation: currentUser.reputation + 2 } // +2 rep immediately for posting
      });
    }
    return post;
  },

  castVote: async (postId, voteType) => {
    if (!get().user) {
      set({ isAuthModalOpen: true });
      return;
    }
    try {
      const updatedPost = await apiService.votePost(postId, voteType);
      
      // Update specific post in the current list
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
        // Update user reputation locally if profile is inspected
      }));

      // Update current user locally since reputation goes up (+2 rep for active participation)
      const currentUser = get().user;
      if (currentUser) {
        const alreadyVoted = get().posts.find(p => p.id === postId)?.user_vote;
        const repBonus = alreadyVoted ? 0 : 2; // +2 reputation if voting first time
        set({
          user: { ...currentUser, reputation: currentUser.reputation + repBonus }
        });
      }

      // Re-trigger auth check to update exact server-side computed reputations
      const latestUser = await apiService.getCurrentUser();
      if (latestUser) {
        set({ user: latestUser });
      }

    } catch (e: any) {
      alert(e.message || 'Ошибка голосования');
    }
  },

  submitComment: async (postId, text) => {
    if (!get().user) {
      set({ isAuthModalOpen: true });
      return;
    }
    const newComment = await apiService.addComment(postId, text);
    set((state) => ({
      comments: [...state.comments, newComment]
    }));
    
    // update state with newest reputation (+1 reputation for adding commentary)
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, reputation: currentUser.reputation + 1 }
      });
    }
  },

  removeComment: async (commentId) => {
    await apiService.deleteComment(commentId);
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId)
    }));
  },

  markNotificationRead: async (id) => {
    await apiService.markNotificationRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    }));
  },

  resetDatabase: async () => {
    await apiService.seedDatabase();
    get().fetchPosts();
    // Reset active profile if open
    set({ activePostId: null, activeProfileUserId: null });
  }
}));
