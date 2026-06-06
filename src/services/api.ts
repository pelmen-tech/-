import { Post, Comment, Notification, UserProfile, Category, PostStatus } from '../types';

const API_BASE = '/api';

// Simple token storage
const TOKEN_KEY = 'pravda_ryadom_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  // Authentication
  async register(email: string, username: string, password_hash: string, avatar_url?: string) {
    const res = await request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password: password_hash, avatar_url }),
    });
    setStoredToken(res.token);
    return res.user;
  },

  async login(login: string, password_hash: string) {
    const res = await request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password: password_hash }),
    });
    setStoredToken(res.token);
    return res.user;
  },

  async getCurrentUser() {
    if (!getStoredToken()) return null;
    try {
      const res = await request<{ user: any }>('/auth/me');
      return res.user;
    } catch (e) {
      removeStoredToken();
      return null;
    }
  },

  logout() {
    removeStoredToken();
  },

  // Posts
  async getPosts(filters?: { search?: string; category?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    
    return request<Post[]>(`/posts?${params.toString()}`);
  },

  async getPostById(id: string) {
    return request<Post>(`/posts/${id}`);
  },

  async createPost(postData: {
    title: string;
    description: string;
    image_url?: string;
    category: Category;
    latitude: number;
    longitude: number;
  }) {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Voting
  async votePost(id: string, voteType: 'confirm' | 'refute') {
    return request<Post>(`/posts/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_type: voteType }),
    });
  },

  // Comments
  async getComments(postId: string) {
    return request<Comment[]>(`/posts/${postId}/comments`);
  },

  async addComment(postId: string, text: string) {
    return request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async deleteComment(commentId: string) {
    return request<{ message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // Profiles
  async getUserProfile(userId: string) {
    return request<UserProfile>(`/users/${userId}`);
  },

  // Notifications
  async getNotifications() {
    return request<Notification[]>('/notifications');
  },

  async markNotificationRead(id: string) {
    return request<{ success: boolean; notif: Notification }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  // Admin/System
  async seedDatabase() {
    return request<{ message: string }>('/system/seed', {
      method: 'POST',
    });
  }
};
export default apiService;
