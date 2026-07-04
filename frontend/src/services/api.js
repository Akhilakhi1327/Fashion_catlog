import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eliteFashionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle silent token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const refreshUrl = isAdminRoute ? '/auth/refresh' : '/users/refresh';

        // Fetch new access token using the HTTP-only refresh cookie
        const res = await axios.post(
          `${api.defaults.baseURL}${refreshUrl}`,
          {},
          { withCredentials: true }
        );

        if (res.data?.success && res.data.token) {
          const newToken = res.data.token;
          localStorage.setItem('eliteFashionToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the failed request with the new access token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, session is completely expired -> clear auth and redirect
        localStorage.removeItem('eliteFashionToken');
        localStorage.removeItem('eliteFashionAdmin');
        
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        // Removed aggressive redirect to /login for customers, so they can browse the site freely.
      }
    }
    return Promise.reject(error);
  }
);

export default api;
