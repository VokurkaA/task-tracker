import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
});

// Auto-attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Initialize Socket but don't connect yet
export const socket = io(API_URL, {
  autoConnect: false,
});