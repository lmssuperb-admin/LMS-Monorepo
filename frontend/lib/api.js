import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('moodle_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const getUserInfo = async () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourseContents = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const getSiteInfo = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;
