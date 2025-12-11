import axios from 'axios';

/**
 * Axios instance configured for the HospitaliaCare API
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error('Network Error: Please check your internet connection');
      return Promise.reject({
        message: 'Network error. Please check your internet connection and try again.',
        type: 'network'
      });
    }
    
    const { status, data } = error.response;
    
    // Handle different error status codes
    switch (status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Access Denied: You do not have permission to perform this action');
        break;
      case 404:
        console.error('Not Found: The requested resource was not found');
        break;
      case 422:
        console.error('Validation Error:', data.message || 'Please check your input');
        break;
      case 500:
        console.error('Server Error: Something went wrong on the server');
        break;
      default:
        console.error('Error:', data.message || 'An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Auth Service - Handle authentication
 */
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/**
 * Appointment Service - Handle appointments CRUD
 */
export const appointmentService = {
  // Get all appointments (users see only theirs, admin sees all)
  getAll: (params = {}) => api.get('/appointments', { params }),
  
  // Get user's own appointments explicitly
  getMyAppointments: () => api.get('/appointments/my'),
  
  // Get single appointment
  getById: (id) => api.get(`/appointments/${id}`),
  
  // Create new appointment
  create: (data) => api.post('/appointments', data),
  
  // Update appointment
  update: (id, data) => api.put(`/appointments/${id}`, data),
  
  // Delete appointment
  delete: (id) => api.delete(`/appointments/${id}`),
  
  // Search appointments
  search: (query) => api.get(`/appointments/search/${query}`),
  
  // Update status only
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  
  // Get appointment statistics
  getStats: () => api.get('/appointments/stats'),
};

/**
 * Admin Service - Handle admin operations
 */
export const adminService = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getChartData: (period) => api.get('/admin/chart-data', { params: { period } }),
  
  // Users management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // All appointments (admin view)
  getAllAppointments: (params = {}) => api.get('/admin/all-appointments', { params }),
  
  // Reports
  getReports: (params = {}) => api.get('/admin/reports', { params }),
};

/**
 * Doctor Service - Handle doctor management
 */
export const doctorService = {
  // Get all active doctors
  getAll: (params = {}) => api.get('/doctors', { params }),
  
  // Get all doctors including inactive (admin)
  getAllForAdmin: () => api.get('/doctors/all'),
  
  // Get single doctor
  getById: (id) => api.get(`/doctors/${id}`),
  
  // Get doctor statistics
  getStats: () => api.get('/doctors/stats'),
  
  // Create new doctor (admin only)
  create: (data) => api.post('/doctors', data),
  
  // Update doctor (admin only)
  update: (id, data) => api.put(`/doctors/${id}`, data),
  
  // Delete doctor (admin only)
  delete: (id) => api.delete(`/doctors/${id}`),
  
  // Toggle doctor status (admin only)
  toggleStatus: (id) => api.patch(`/doctors/${id}/toggle-status`),
};

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;
    return {
      message: data.message || data.errorMessages?.[0] || 'An error occurred',
      errors: data.errors || [],
      status,
      type: 'server'
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your connection.',
      type: 'network'
    };
  } else if (error.type === 'network') {
    // Network error from interceptor
    return {
      message: error.message,
      type: 'network'
    };
  } else {
    // Something else went wrong
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'unknown'
    };
  }
};

export default api;
