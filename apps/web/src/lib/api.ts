import axios from 'axios';
import { supabase } from './supabase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        return api.request(error.config);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Families
export const familiesApi = {
  create: (data: any) => api.post('/families', data).then((r) => r.data),
  list: () => api.get('/families').then((r) => r.data),
  get: (id: string) => api.get(`/families/${id}`).then((r) => r.data),
  members: (id: string) => api.get(`/families/${id}/members`).then((r) => r.data),
  invite: (id: string, userId: string) =>
    api.post(`/families/${id}/members`, { userId }).then((r) => r.data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/families/${id}/members/${userId}`).then((r) => r.data),
};

// Family Tree
export const treeApi = {
  getTree: (familyId: string) =>
    api.get(`/families/${familyId}/tree`).then((r) => r.data),
  addRelation: (familyId: string, data: any) =>
    api.post(`/families/${familyId}/tree/relations`, data).then((r) => r.data),
  removeRelation: (familyId: string, relationId: string) =>
    api.delete(`/families/${familyId}/tree/relations/${relationId}`).then((r) => r.data),
};

// Events
export const eventsApi = {
  create: (familyId: string, data: any) =>
    api.post(`/families/${familyId}/events`, data).then((r) => r.data),
  list: (familyId: string) =>
    api.get(`/families/${familyId}/events`).then((r) => r.data),
  upcoming: (familyId: string) =>
    api.get(`/families/${familyId}/events/upcoming`).then((r) => r.data),
  get: (familyId: string, eventId: string) =>
    api.get(`/families/${familyId}/events/${eventId}`).then((r) => r.data),
  respond: (familyId: string, eventId: string, status: string) =>
    api.post(`/families/${familyId}/events/${eventId}/respond`, { status }).then((r) => r.data),
  delete: (familyId: string, eventId: string) =>
    api.delete(`/families/${familyId}/events/${eventId}`).then((r) => r.data),
};

// Chat
export const chatApi = {
  getGroups: (familyId: string) =>
    api.get(`/families/${familyId}/chat/groups`).then((r) => r.data),
  createGroup: (familyId: string, data: any) =>
    api.post(`/families/${familyId}/chat/groups`, data).then((r) => r.data),
  getMessages: (familyId: string, groupId: string, page = 1) =>
    api.get(`/families/${familyId}/chat/groups/${groupId}/messages`, { params: { page } }).then((r) => r.data),
  sendMessage: (familyId: string, groupId: string, content: string) =>
    api.post(`/families/${familyId}/chat/groups/${groupId}/messages`, { content }).then((r) => r.data),
};

// Feed
export const feedApi = {
  getPosts: (familyId: string, page = 1) =>
    api.get(`/families/${familyId}/feed`, { params: { page } }).then((r) => r.data),
  createPost: (familyId: string, content: string, imageUrl?: string) =>
    api.post(`/families/${familyId}/feed`, { content, imageUrl }).then((r) => r.data),
  addComment: (familyId: string, postId: string, content: string) =>
    api.post(`/families/${familyId}/feed/${postId}/comments`, { content }).then((r) => r.data),
  toggleLike: (familyId: string, postId: string) =>
    api.post(`/families/${familyId}/feed/${postId}/like`).then((r) => r.data),
};

// Media — uses signed upload URL pattern (browser → Supabase Storage directly)
export const mediaApi = {
  getAlbums: (familyId: string) =>
    api.get(`/families/${familyId}/media/albums`).then((r) => r.data),
  createAlbum: (familyId: string, name: string, eventId?: string) =>
    api.post(`/families/${familyId}/media/albums`, { name, eventId }).then((r) => r.data),
  getAlbum: (familyId: string, albumId: string) =>
    api.get(`/families/${familyId}/media/albums/${albumId}`).then((r) => r.data),
  getMedia: (familyId: string, albumId?: string) =>
    api.get(`/families/${familyId}/media`, { params: albumId ? { albumId } : {} }).then((r) => r.data),
  deleteMedia: (familyId: string, mediaId: string) =>
    api.delete(`/families/${familyId}/media/${mediaId}`).then((r) => r.data),

  uploadMedia: async (familyId: string, file: File, albumId?: string) => {
    // 1. Get signed upload URL from Worker
    const { signedUrl, path, token } = await api
      .post(`/families/${familyId}/media/upload-url`, {
        filename: file.name,
        mimeType: file.type,
        albumId,
      })
      .then((r) => r.data);

    // 2. PUT file directly to Supabase Storage
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Upload to storage failed');

    // 3. Confirm upload to Worker so it writes the DB record
    return api
      .post(`/families/${familyId}/media/confirm`, {
        path,
        token,
        mimeType: file.type,
        name: file.name,
        size: file.size,
        albumId,
      })
      .then((r) => r.data);
  },
};

// Polls
export const pollsApi = {
  create: (familyId: string, data: any) =>
    api.post(`/families/${familyId}/polls`, data).then((r) => r.data),
  list: (familyId: string) =>
    api.get(`/families/${familyId}/polls`).then((r) => r.data),
  get: (familyId: string, pollId: string) =>
    api.get(`/families/${familyId}/polls/${pollId}`).then((r) => r.data),
  vote: (familyId: string, pollId: string, optionIndex: number) =>
    api.post(`/families/${familyId}/polls/${pollId}/vote`, { optionIndex }).then((r) => r.data),
  delete: (familyId: string, pollId: string) =>
    api.delete(`/families/${familyId}/polls/${pollId}`).then((r) => r.data),
};

// Contributions
export const contributionsApi = {
  create: (familyId: string, data: any) =>
    api.post(`/families/${familyId}/contributions`, data).then((r) => r.data),
  list: (familyId: string) =>
    api.get(`/families/${familyId}/contributions`).then((r) => r.data),
  get: (familyId: string, id: string) =>
    api.get(`/families/${familyId}/contributions/${id}`).then((r) => r.data),
  pledge: (familyId: string, id: string, data: any) =>
    api.post(`/families/${familyId}/contributions/${id}/pledge`, data).then((r) => r.data),
  updatePayment: (familyId: string, paymentId: string, data: any) =>
    api.patch(`/families/${familyId}/contributions/payments/${paymentId}`, data).then((r) => r.data),
};

// Notifications
export const notificationsApi = {
  list: (page = 1) =>
    api.get('/notifications', { params: { page } }).then((r) => r.data),
  unreadCount: () =>
    api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};

// Users
export const usersApi = {
  me: () => api.get('/users/me').then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  search: (q: string) => api.get('/users/search', { params: { q } }).then((r) => r.data),
  updateProfile: (data: any) => api.patch('/users/profile', data).then((r) => r.data),
};
