import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client

// Auth API
export const auth = {
  login: (email, password) =>
    client.post('/api/auth/login', { email, password }),
  
  register: (email, password, name) =>
    client.post('/api/auth/register', { email, password, name }),
  
  google: (idToken) =>
    client.post('/api/auth/google', { id_token: idToken }),
  
  me: () =>
    client.get('/api/auth/me'),
}

// Accounts API
export const accounts = {
  list: () =>
    client.get('/api/accounts'),
  
  create: (data) =>
    client.post('/api/accounts', data),
  
  update: (id, data) =>
    client.put(`/api/accounts/${id}`, data),
  
  delete: (id) =>
    client.delete(`/api/accounts/${id}`),
  
  test: (id) =>
    client.post(`/api/accounts/${id}/test`),
}

// Trading API
export const trading = {
  status: () =>
    client.get('/api/trading/status'),
  
  start: (settings) =>
    client.post('/api/trading/start', settings),
  
  stop: () =>
    client.post('/api/trading/stop'),
  
  updateSettings: (settings) =>
    client.put('/api/trading/settings', settings),
}

// Positions API
export const positions = {
  open: () =>
    client.get('/api/positions/open'),
  
  history: (params) =>
    client.get('/api/positions/history', { params }),
  
  stats: (days = 30) =>
    client.get('/api/positions/stats', { params: { days } }),
}

// Admin API
export const admin = {
  users: () =>
    client.get('/api/admin/users'),
  
  userDetail: (id) =>
    client.get(`/api/admin/users/${id}`),
  
  suspend: (id) =>
    client.post(`/api/admin/users/${id}/suspend`),
  
  activate: (id) =>
    client.post(`/api/admin/users/${id}/activate`),
  
  stats: () =>
    client.get('/api/admin/stats'),
}
