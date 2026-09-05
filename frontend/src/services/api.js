import axios from 'axios';

const TOKEN_KEY = 'sv360_token';
const USER_KEY = 'sv360_user';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Only a genuine 401 (invalid/expired token) clears the session. Network
// errors, timeouts, and 5xx responses are left alone so a flaky connection
// or a slow-to-wake backend never logs the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
