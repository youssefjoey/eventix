import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
   withCredentials: true, // ✅ important for session-based auth

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', null, {
    params: { email, password }
  }),
};

// Event Services
export const eventService = {
  getAllEvents: () => api.get('/events'),
  getEventById: (id) => api.get(`/events/${id}`),
  getEventsByCategory: (categoryId) => api.get(`/events/byCategory/${categoryId}`),
  searchEvents: (query) => api.get('/events', { params: { search: query } }),
};

// Category Services
export const categoryService = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
};

// Reservation Services
export const reservationService = {
  createReservation: (data) => api.post('/reservations', data),
  getReservationsByUser: (userId) => api.get(`/reservations/${userId}`),
};

// Payment Services
export const paymentService = {
  createPayment: (data) => api.post('/payments', data),
  getPaymentByReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
};

// Ticket Services
export const ticketService = {
  getTicketByReservation: (reservationId) => api.get(`/tickets/reservation/${reservationId}`),
  getAllTicketsByReservation: (reservationId) => api.get(`/tickets/byReservation/${reservationId}`),
  getTicketByCode: (code) => api.get(`/tickets/code/${code}`),
  getAllTickets: () => api.get('/tickets'),
};

// User Services
export const userService = {
  getUserById: (id) => api.get(`/users/${id}`),
  getAllUsers: () => api.get('/users'),
  checkIsAdmin: (userId) => api.get(`/users/${userId}/is-admin`),
};

// Admin Services
export const adminService = {
  // Events
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  // Categories
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Reservations
  getAllReservations: () => api.get('/admin/reservations'),
  cancelReservation: (id) => api.delete(`/admin/reservations/${id}`),
};

export default api;

