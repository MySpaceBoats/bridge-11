import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data).then((r) => r.data),
  login: (data: any) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

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

// Media
export const mediaApi = {
  getAlbums: (familyId: string) =>
    api.get(`/families/${familyId}/media/albums`).then((r) => r.data),
  createAlbum: (familyId: string, name: string, eventId?: string) =>
    api.post(`/families/${familyId}/media/albums`, { name, eventId }).then((r) => r.data),
  getAlbum: (familyId: string, albumId: string) =>
    api.get(`/families/${familyId}/media/albums/${albumId}`).then((r) => r.data),
  uploadMedia: (familyId: string, file: File, albumId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (albumId) formData.append('albumId', albumId);
    return api.post(`/families/${familyId}/media/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
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
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  search: (q: string) => api.get('/users/search', { params: { q } }).then((r) => r.data),
  updateProfile: (data: any) => api.patch('/users/profile', data).then((r) => r.data),
};
