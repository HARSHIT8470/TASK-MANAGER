import api from './axios';

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
  getUsers: ()   => api.get('/auth/users'),
};

export const projectAPI = {
  getAll:       (params) => api.get('/projects', { params }),
  getById:      (id)     => api.get(`/projects/${id}`),
  create:       (data)   => api.post('/projects', data),
  update:       (id, data) => api.put(`/projects/${id}`, data),
  delete:       (id)     => api.delete(`/projects/${id}`),
  addMember:    (id, userId)   => api.put(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId)   => api.delete(`/projects/${id}/members/${userId}`),
};

export const taskAPI = {
  getAll:   (params) => api.get('/tasks', { params }),
  getById:  (id)     => api.get(`/tasks/${id}`),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)     => api.delete(`/tasks/${id}`),
  getStats: ()       => api.get('/tasks/stats'),
};
