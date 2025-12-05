import axios from 'axios';

// Всегда используем корректный URL из .env
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Установка админ-токена в axios
export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common['x-admin-token'] = token;
  } else {
    delete api.defaults.headers.common['x-admin-token'];
  }
}
